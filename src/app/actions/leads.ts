'use server';

import { supabaseServer as supabase } from '@/lib/supabase-server';

export interface VisitorData {
  fullName?: string;
  name?: string;
  phoneNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  budget?: string;
  active_request_type?: string;
  pref_ts?: string;
  ip?: string;
  domain?: string;
  ref?: string;
  shortlist_items_json?: any[];
}

export async function upsertVisitorAction(visitorData: VisitorData) {
  if (!visitorData.phoneNumber && !visitorData.phone) {
    throw new Error('Phone number is required');
  }

  const { data, error } = await supabase
    .from('visitors')
    .upsert({
      name: visitorData.fullName || visitorData.name,
      phone: visitorData.phoneNumber || visitorData.phone,
      email: visitorData.email,
      address: visitorData.address,
      budget: visitorData.budget,
      active_request_type: visitorData.active_request_type || 'other',
      pref_ts: visitorData.pref_ts,
      ip: visitorData.ip || null,
      domain: visitorData.domain || null,
      ref: visitorData.ref || null,
      shortlist_items_json: visitorData.shortlist_items_json || [],
      updated_at: new Date().toISOString()
    }, { onConflict: 'phone' })
    .select()
    .single();

  if (error) {
    console.error('Error in upsertVisitor server action:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(`Failed to save visitor data: ${error.message}`);
  }
  return data;
}

export async function submitInquiryAction(inquiryData: any) {
  // 1. Create or Update Visitor
  const visitor = await upsertVisitorAction({
    ...inquiryData,
    active_request_type: inquiryData.type || 'inquiry'
  });

  // 2. Insert into inquiries
  const { data, error } = await supabase.from('inquiries').insert([{
    ...inquiryData,
    visitor_id: visitor.id
  }]);
  
  if (error) {
    console.error('Error in submitInquiry server action:', error.message);
    throw new Error('Failed to submit inquiry');
  }
  return { visitor, data };
}

export async function submitConsultationRequestAction(request: any) {
  // Build a valid timestamptz or null for pref_ts.
  // A specific date (YYYY-MM-DD) can be coerced to a timestamptz;
  // a time-of-day label like "Afternoon (1 - 4)" cannot — store that in active_request_type.
  let pref_ts: string | null = null;
  if (request.preferredDate) {
    // Handle both "YYYY-MM-DD" (date only) and "YYYY-MM-DDTHH:mm" (datetime-local)
    const d = new Date(request.preferredDate);
    if (!isNaN(d.getTime())) {
      pref_ts = d.toISOString();
    }
  }

  // Encode preferred time slot in the request type so it's not lost
  const activeRequestType = request.preferredTime
    ? `${request.type}:${request.preferredTime}`
    : request.type;

  // Build shortlist_items_json including any property notes (inquiries)
  const inquiries: Record<string, any> = request.inquiries || {};
  const shortlistItems = (request.propertyIds ?? []).map((id: string) => ({
    property_id: id,
    notes: inquiries[id]?.question || '',
    added_at: Date.now(),
  }));

  // 1. Upsert Visitor
  const visitor = await upsertVisitorAction({
    ...request.contactDetails,
    active_request_type: activeRequestType,
    pref_ts,
    shortlist_items_json: shortlistItems,
  });

  return visitor;
}

export async function syncShortlistAction(visitorData: any, shortlistItems: string[], inquiries: Record<string, any>) {
  // Guard: don't attempt sync without a phone number
  if (!visitorData?.phoneNumber && !visitorData?.phone) {
    return null;
  }
  return upsertVisitorAction({
    ...visitorData,
    shortlist_items_json: shortlistItems.map(id => ({
      property_id: id,
      notes: inquiries[id]?.question || '',
      added_at: Date.now()
    }))
  });
}

export async function submitPropertyForSaleAction(propertyData: any, visitorData: any) {
  // 1. Create or Update Visitor
  const visitor = await upsertVisitorAction({
    ...visitorData,
    active_request_type: 'sell'
  });

  // 2. Insert into for_sell_requests
  const { data, error } = await supabase
    .from('for_sell_requests')
    .insert([{
      visitor_id: visitor.id,
      property_type: propertyData.type,
      city: propertyData.city,
      area: propertyData.area,
      price: parseFloat(propertyData.price),
      size: parseFloat(propertyData.size),
      size_unit: propertyData.size_unit,
      description: propertyData.description,
      landmark_location: propertyData.location ? `${propertyData.location.lat},${propertyData.location.lng}` : null,
      status: 'pending'
    }]);

  if (error) {
    console.error('Error in submitPropertyForSale server action:', error.message);
    throw new Error('Failed to submit property for sale');
  }
  
  return { visitor, data };
}

export async function getUserListingsAction(phone: string) {
  const { data: visitor } = await supabase.from('visitors').select('id').eq('phone', phone).single();
  if (!visitor) return [];
  
  const { data } = await supabase
    .from('for_sell_requests')
    .select('*')
    .eq('visitor_id', visitor.id)
    .order('created_at', { ascending: false });
    
  return data || [];
}

export async function deleteUserListingAction(id: string) {
  const { error } = await supabase.from('for_sell_requests').delete().eq('id', id);
  if (error) {
    throw new Error('Failed to delete listing');
  }
  return true;
}

