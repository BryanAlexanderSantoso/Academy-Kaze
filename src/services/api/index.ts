import { coursesApi } from './courses';
import { assignmentsApi } from './assignments';
import { profilesApi } from './profiles';
import { paymentsApi } from './payments';
import { chaptersApi } from './chapters';
import { promosApi } from './promos';
import { storageApi } from './storage';
import { questionnairesApi } from './questionnaires';
import { authApi } from './auth';
import { supportApi } from './support';

/**
 * Unified API Client for Kaze Developer
 * This acts as a RESTful abstraction layer.
 * Future mobile apps can use the same logic structure.
 */
export const api = {
    courses: coursesApi,
    assignments: assignmentsApi,
    profiles: profilesApi,
    payments: paymentsApi,
    chapters: chaptersApi,
    promos: promosApi,
    storage: storageApi,
    questionnaires: questionnairesApi,
    auth: authApi,
    support: supportApi,
};

export default api;
