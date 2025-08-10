-- Sample data for MediLink Health application
-- This script adds sample users, patients, and audit logs for testing

USE hospital;

-- Insert sample hospitals
INSERT INTO hospitals (hospital_id, name, address, city, state, phone_number, email, created_at) VALUES
(1, 'Central Medical Hospital', '123 Medical Center Dr', 'Nairobi', 'Nairobi County', '+254-700-123456', 'info@centralmedical.co.ke', NOW()),
(2, 'Kenyatta National Hospital', '456 Hospital Rd', 'Nairobi', 'Nairobi County', '+254-700-789012', 'info@knh.or.ke', NOW());

-- Insert sample departments
INSERT INTO departments (department_id, hospital_id, name, description, created_at) VALUES
(1, 1, 'Emergency Medicine', 'Emergency and trauma care', NOW()),
(2, 1, 'Internal Medicine', 'General internal medicine', NOW()),
(3, 1, 'Pediatrics', 'Child healthcare', NOW()),
(4, 2, 'Cardiology', 'Heart and cardiovascular care', NOW()),
(5, 2, 'Orthopedics', 'Bone and joint care', NOW());

-- Insert sample users (doctors and staff)
-- Password for all users is 'password123' (hashed with bcrypt)
INSERT INTO users (user_id, username, password_hash, email, first_name, last_name, hospital_id, department_id, created_at) VALUES
(1, 'dr.smith', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 'dr.smith@centralmedical.co.ke', 'John', 'Smith', 1, 1, NOW()),
(2, 'dr.johnson', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 'dr.johnson@centralmedical.co.ke', 'Sarah', 'Johnson', 1, 2, NOW()),
(3, 'dr.williams', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 'dr.williams@knh.or.ke', 'Michael', 'Williams', 2, 4, NOW()),
(4, 'nurse.brown', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 'nurse.brown@centralmedical.co.ke', 'Emily', 'Brown', 1, 1, NOW()),
(5, 'admin.davis', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', 'admin.davis@centralmedical.co.ke', 'Robert', 'Davis', 1, NULL, NOW());

-- Assign roles to users
INSERT INTO user_roles (user_id, role_id, created_at) VALUES
(1, 2, NOW()), -- Dr. Smith - Doctor
(2, 2, NOW()), -- Dr. Johnson - Doctor
(3, 2, NOW()), -- Dr. Williams - Doctor
(4, 3, NOW()), -- Nurse Brown - Nurse
(5, 1, NOW()); -- Admin Davis - Admin

-- Insert sample patients
INSERT INTO patients (patient_id, hospital_id, first_name, last_name, date_of_birth, gender_id, address, city, phone_number, email, emergency_contact_name, emergency_contact_phone, national_id_number, created_by, created_at) VALUES
(1001, 1, 'James', 'Mwangi', '1985-03-15', 1, '789 Kenyatta Ave', 'Nairobi', '+254-722-123456', 'james.mwangi@email.com', 'Mary Mwangi', '+254-722-654321', '12345678', 1, NOW()),
(1002, 1, 'Grace', 'Wanjiku', '1990-07-22', 2, '456 Uhuru Highway', 'Nairobi', '+254-733-789012', 'grace.wanjiku@email.com', 'Peter Wanjiku', '+254-733-210987', '23456789', 2, NOW()),
(1003, 2, 'David', 'Kipchoge', '1978-11-08', 1, '123 Moi Ave', 'Nairobi', '+254-744-345678', 'david.kipchoge@email.com', 'Susan Kipchoge', '+254-744-876543', '34567890', 3, NOW()),
(1004, 1, 'Faith', 'Akinyi', '1995-05-30', 2, '321 Tom Mboya St', 'Nairobi', '+254-755-456789', 'faith.akinyi@email.com', 'John Akinyi', '+254-755-987654', '45678901', 1, NOW()),
(1005, 2, 'Samuel', 'Mutua', '1982-12-12', 1, '654 Haile Selassie Ave', 'Nairobi', '+254-766-567890', 'samuel.mutua@email.com', 'Rose Mutua', '+254-766-098765', '56789012', 3, NOW());

-- Create medical records for patients
INSERT INTO medical_records (record_id, patient_id, created_by, created_at) VALUES
(1, 1001, 1, NOW()),
(2, 1002, 2, NOW()),
(3, 1003, 3, NOW()),
(4, 1004, 1, NOW()),
(5, 1005, 3, NOW());

-- Insert sample patient encounters
INSERT INTO patient_encounters (encounter_id, record_id, patient_id, doctor_id, encounter_date_time, chief_complaint, diagnosis_description, treatment_plan, notes, created_by, created_at) VALUES
(1, 1, 1001, 1, '2024-01-15 09:30:00', 'Chest pain and shortness of breath', 'Acute myocardial infarction', 'Emergency cardiac catheterization, aspirin, beta-blockers', 'Patient stable after treatment', 1, NOW()),
(2, 2, 1002, 2, '2024-01-16 14:15:00', 'Fever and cough for 3 days', 'Upper respiratory tract infection', 'Antibiotics, rest, fluids', 'Follow up in 1 week', 2, NOW()),
(3, 3, 1003, 3, '2024-01-17 11:00:00', 'Knee pain after fall', 'Knee contusion, possible ligament strain', 'Rest, ice, compression, elevation. Physiotherapy', 'X-ray shows no fracture', 3, NOW()),
(4, 4, 1004, 1, '2024-01-18 16:45:00', 'Routine prenatal checkup', 'Normal pregnancy progression', 'Continue prenatal vitamins, next visit in 4 weeks', '20 weeks gestation, all normal', 1, NOW()),
(5, 5, 1005, 3, '2024-01-19 10:20:00', 'Diabetes follow-up', 'Type 2 diabetes mellitus, well controlled', 'Continue metformin, dietary counseling', 'HbA1c 6.8%, good control', 3, NOW());

-- Insert sample audit logs
INSERT INTO audit_logs (log_id, user_id, action_type, module, table_name, record_id_affected, old_value, new_value, ip_address, action_timestamp, is_success) VALUES
(1, 1, 'LOGIN', 'AUTH', NULL, NULL, NULL, NULL, '192.168.1.100', '2024-01-15 08:00:00', 1),
(2, 1, 'VIEW', 'PATIENTS', 'patients', 1001, NULL, NULL, '192.168.1.100', '2024-01-15 09:00:00', 1),
(3, 1, 'CREATE', 'PATIENTS', 'patient_encounters', 1, NULL, '{"chief_complaint": "Chest pain and shortness of breath", "diagnosis": "Acute myocardial infarction"}', '192.168.1.100', '2024-01-15 09:30:00', 1),
(4, 2, 'LOGIN', 'AUTH', NULL, NULL, NULL, NULL, '192.168.1.101', '2024-01-16 13:00:00', 1),
(5, 2, 'SEARCH', 'PATIENTS', 'patients', NULL, '{"search_query": "Grace", "search_type": "name"}', NULL, '192.168.1.101', '2024-01-16 14:00:00', 1),
(6, 2, 'VIEW', 'PATIENTS', 'patients', 1002, NULL, NULL, '192.168.1.101', '2024-01-16 14:10:00', 1),
(7, 2, 'UPDATE', 'PATIENTS', 'patients', 1002, '{"phone_number": "+254-733-789012"}', '{"phone_number": "+254-733-789013"}', '192.168.1.101', '2024-01-16 14:30:00', 1),
(8, 3, 'LOGIN', 'AUTH', NULL, NULL, NULL, NULL, '192.168.1.102', '2024-01-17 10:00:00', 1),
(9, 3, 'VIEW', 'PATIENTS', 'patients', 1003, NULL, NULL, '192.168.1.102', '2024-01-17 10:30:00', 1),
(10, 1, 'LOGOUT', 'AUTH', NULL, NULL, NULL, NULL, '192.168.1.100', '2024-01-15 17:00:00', 1);

-- Insert sample lab tests
INSERT INTO lab_tests (lab_test_id, test_name, description, normal_range, unit, created_at) VALUES
(1, 'Complete Blood Count', 'Full blood count analysis', 'Various', 'Various', NOW()),
(2, 'Blood Glucose', 'Fasting blood glucose test', '70-100', 'mg/dL', NOW()),
(3, 'Cholesterol Panel', 'Lipid profile test', '<200', 'mg/dL', NOW()),
(4, 'Hemoglobin A1C', 'Average blood sugar over 3 months', '<7.0', '%', NOW()),
(5, 'Creatinine', 'Kidney function test', '0.6-1.2', 'mg/dL', NOW());

-- Insert sample medications
INSERT INTO medications (medication_id, name, generic_name, dosage_form, strength, unit, manufacturer, created_at) VALUES
(1, 'Aspirin', 'Acetylsalicylic acid', 'Tablet', '81', 'mg', 'Generic Pharma', NOW()),
(2, 'Metformin', 'Metformin hydrochloride', 'Tablet', '500', 'mg', 'Diabetes Care Ltd', NOW()),
(3, 'Lisinopril', 'Lisinopril', 'Tablet', '10', 'mg', 'Heart Health Inc', NOW()),
(4, 'Amoxicillin', 'Amoxicillin', 'Capsule', '500', 'mg', 'Antibiotic Co', NOW()),
(5, 'Ibuprofen', 'Ibuprofen', 'Tablet', '200', 'mg', 'Pain Relief Ltd', NOW());

-- Update last login times for users
UPDATE users SET last_login_at = NOW() WHERE user_id IN (1, 2, 3);

-- Add some blockchain hashes for demonstration (in real implementation, these would be actual hashes)
UPDATE patients SET blockchain_hash = CONCAT('patient_', patient_id, '_', UNIX_TIMESTAMP()) WHERE patient_id IN (1001, 1002, 1003, 1004, 1005);
UPDATE audit_logs SET blockchain_hash = CONCAT('audit_', log_id, '_', UNIX_TIMESTAMP()) WHERE log_id IN (1, 2, 3, 4, 5);

COMMIT;