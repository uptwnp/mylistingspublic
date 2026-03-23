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
      ip: visitorData.ip,
      domain: visitorData.domain,
      ref: visitorData.ref,
      shortlist_items_json: visitorData.shortlist_items_json || [],
      updated_at: new Date().toISOString()
    }, { onConflict: 'phone' })
    .select()
    .single();

  if (error) {
    console.error('Error in upsertVisitor server action:', error.message);
    throw new Error('Failed to save visitor data');
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
  // 1. Upsert Visitor first
  const visitor = await upsertVisitorAction({
    ...request.contactDetails,
    active_request_type: request.type,
    pref_ts: request.preferredDate || request.preferredTime
  });

  // 2. We can log the specific consultation details if you have a table for it
  // For now, syncing with your current logic in ShortlistContext.tsx
  return visitor;
}

export async function syncShortlistAction(visitorData: any, shortlistItems: string[], inquiries: Record<string, any>) {
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
