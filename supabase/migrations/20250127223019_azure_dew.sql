/*
  # Gift Registry Schema

  1. New Tables
    - `gifts`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the gift
      - `selected` (boolean) - Whether the gift has been selected
      - `selected_by` (text) - Name of the person who selected the gift
      - `created_at` (timestamp)
    
  2. Security
    - Enable RLS on `gifts` table
    - Add policies for public access (since this is a public gift registry)
*/

CREATE TABLE IF NOT EXISTS gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  selected boolean DEFAULT false,
  selected_by text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read gifts
CREATE POLICY "Anyone can view gifts"
  ON gifts
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to insert gifts
CREATE POLICY "Anyone can add gifts"
  ON gifts
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to update gifts
CREATE POLICY "Anyone can update gifts"
  ON gifts
  FOR UPDATE
  TO public
  USING (true);