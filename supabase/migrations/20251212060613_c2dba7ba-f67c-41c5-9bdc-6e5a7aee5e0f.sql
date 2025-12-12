-- Add 8 new operational area fields to idea_validations table
ALTER TABLE public.idea_validations 
ADD COLUMN market_response text,
ADD COLUMN product_response text,
ADD COLUMN business_model_response text,
ADD COLUMN marketing_response text,
ADD COLUMN operations_response text,
ADD COLUMN finance_response text,
ADD COLUMN team_response text,
ADD COLUMN legal_response text;