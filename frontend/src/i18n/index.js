import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      "dashboard": "Dashboard",
      "patientSearch": "Patient Search",
      "auditTrail": "Audit Trail",
      "logout": "Logout",
      
      // Common
      "loading": "Loading...",
      "error": "Error",
      "save": "Save",
      "cancel": "Cancel",
      "edit": "Edit",
      "delete": "Delete",
      "search": "Search",
      "back": "Back",
      "next": "Next",
      "previous": "Previous",
      
      // Patient related
      "patientId": "Patient ID",
      "firstName": "First Name",
      "lastName": "Last Name",
      "phoneNumber": "Phone Number",
      "email": "Email",
      "address": "Address",
      "city": "City",
      "dateOfBirth": "Date of Birth",
      "gender": "Gender",
      "nationalId": "National ID",
      "emergencyContact": "Emergency Contact",
      "medicalEncounters": "Medical Encounters",
      "newEncounter": "New Encounter",
      "editRecord": "Edit Record",
      "showQR": "Show QR",
      "hideQR": "Hide QR",
      "viewDetails": "View Details",
      
      // Search
      "searchBy": "Search by",
      "searchQuery": "Search query",
      "searchResults": "Search Results",
      "noResults": "No results found",
      
      // Audit
      "auditLogs": "Audit Logs",
      "user": "User",
      "action": "Action",
      "timestamp": "Timestamp",
      "details": "Details",
      
      // Dashboard
      "welcome": "Welcome",
      "systemStatus": "System Status",
      "todaysActivity": "Today's Activity",
      "mostActiveUsers": "Most Active Users",
      "connectionStatus": "Connection Status",
      "online": "Online",
      "offline": "Offline",
      "workingOffline": "Working Offline",
      
      // Login
      "login": "Login",
      "username": "Username",
      "password": "Password",
      "signIn": "Sign In",
      
      // Additional
      "patientQRCode": "Patient QR Code",
      "date": "Date",
      "doctor": "Doctor",
      "chiefComplaint": "Chief Complaint",
      "diagnosis": "Diagnosis",
      "actions": "Actions",
      "filters": "Filters",
      "startDate": "Start Date",
      "endDate": "End Date",
      "actionType": "Action Type",
      "ipAddress": "IP Address",
      "module": "Module",
      "success": "Success",
      "updatePatient": "Update Patient",
      "personalInfo": "Personal Information",
      "contactInfo": "Contact Information",
      "name": "Name",
      "patientName": "Patient Name",
      "age": "Age",
      "phone": "Phone",
      "viewRecord": "View Record",
      "userId": "User ID",
      "signingIn": "Signing In",
      "home": "Home",
      "about": "About",
      
      
      // Landing Page
      "modernHealthcareManagement": "Modern Healthcare Management System",
      "getStarted": "Get Started",
      "learnMore": "Learn More",
      "keyFeatures": "Key Features",
      "patientManagement": "Patient Management",
      "comprehensivePatientRecords": "Comprehensive patient records and medical history tracking",
      "analytics": "Analytics",
      "insightfulHealthAnalytics": "Insightful health analytics and reporting tools",
      "security": "Security",
      "enterpriseGradeSecurity": "Enterprise-grade security and data protection",
      
      // About Page
      "aboutMediLink": "About MediLink Health",
      "transformingHealthcare": "Transforming healthcare management with cutting-edge technology",
      "ourMission": "Our Mission",
      "missionDescription": "To revolutionize healthcare management by providing intuitive, secure, and comprehensive digital solutions that empower healthcare professionals to deliver exceptional patient care while streamlining administrative processes.",
      "whyChooseUs": "Why Choose MediLink Health?",
      "efficiency": "Efficiency",
      "efficiencyDescription": "Streamline workflows and reduce administrative burden with our intuitive interface",
      "reliability": "Reliability",
      "reliabilityDescription": "99.9% uptime with enterprise-grade security and data protection",
      "innovation": "Innovation",
      "innovationDescription": "Cutting-edge features powered by the latest healthcare technology standards",
      "readyToStart": "Ready to Get Started?",
      "joinThousands": "Join thousands of healthcare professionals already using MediLink Health",
      
      // QR Scanner
      "qrScanner": "QR Scanner",
      "scanPatientQR": "Point camera at patient QR code",
      "stopScanning": "Stop Scanning",
      "startScanning": "Start Scanning",
      "scannerStopped": "Scanner stopped"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;