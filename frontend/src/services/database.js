import Dexie from 'dexie';

// IndexedDB for offline storage
export class OfflineDatabase extends Dexie {
  constructor() {
    super('MediLinkDB');
    
    this.version(1).stores({
      patients: '++id, patient_id, first_name, last_name, phone_number, national_id_number, synced',
      encounters: '++id, encounter_id, patient_id, doctor_id, encounter_date_time, synced',
      auditLogs: '++id, user_id, action_type, timestamp, synced',
      syncQueue: '++id, table, action, data, timestamp',
      users: '++id, user_id, username, first_name, last_name, roles'
    });
  }
}

export const db = new OfflineDatabase();

// Sync queue management
export const addToSyncQueue = async (table, action, data) => {
  await db.syncQueue.add({
    table,
    action,
    data,
    timestamp: new Date()
  });
};

// Patient operations
export const savePatientOffline = async (patient) => {
  const existingPatient = await db.patients.where('patient_id').equals(patient.patient_id).first();
  
  if (existingPatient) {
    await db.patients.update(existingPatient.id, { ...patient, synced: false });
  } else {
    await db.patients.add({ ...patient, synced: false });
  }
  
  await addToSyncQueue('patients', 'update', patient);
};

export const getPatientOffline = async (patientId) => {
  return await db.patients.where('patient_id').equals(patientId).first();
};

export const searchPatientsOffline = async (query, searchType) => {
  let results = [];
  
  switch (searchType) {
    case 'id':
      results = await db.patients.where('patient_id').equals(parseInt(query)).toArray();
      break;
    case 'national_id':
      results = await db.patients.where('national_id_number').equals(query).toArray();
      break;
    case 'phone':
      results = await db.patients.filter(p => p.phone_number && p.phone_number.includes(query)).toArray();
      break;
    case 'name':
      results = await db.patients.filter(p => 
        (p.first_name && p.first_name.toLowerCase().includes(query.toLowerCase())) ||
        (p.last_name && p.last_name.toLowerCase().includes(query.toLowerCase()))
      ).toArray();
      break;
    default:
      results = await db.patients.limit(50).toArray();
  }
  
  return results;
};

// Encounter operations
export const saveEncounterOffline = async (encounter) => {
  await db.encounters.add({ ...encounter, synced: false });
  await addToSyncQueue('encounters', 'create', encounter);
};

export const getPatientEncountersOffline = async (patientId) => {
  return await db.encounters.where('patient_id').equals(patientId).toArray();
};

// Audit log operations
export const saveAuditLogOffline = async (auditLog) => {
  await db.auditLogs.add({ ...auditLog, synced: false });
  await addToSyncQueue('auditLogs', 'create', auditLog);
};

// Sync operations
export const getSyncQueue = async () => {
  return await db.syncQueue.orderBy('timestamp').toArray();
};

export const clearSyncQueue = async () => {
  await db.syncQueue.clear();
};

export const removeSyncItem = async (id) => {
  await db.syncQueue.delete(id);
};

// User operations
export const saveUserOffline = async (user) => {
  const existingUser = await db.users.where('user_id').equals(user.user_id).first();
  
  if (existingUser) {
    await db.users.update(existingUser.id, user);
  } else {
    await db.users.add(user);
  }
};

export const getCurrentUserOffline = async () => {
  const users = await db.users.toArray();
  return users.length > 0 ? users[0] : null;
};