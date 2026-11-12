export type BillingStatus = 'Trial' | 'Unpaid' | 'Partially Paid' | 'Paid';

export type DocumentType = 'Contract' | 'Invoice' | 'Release_Form' | 'Passport' | 'Other';

export interface Client {
  id: number;
  fullName: string;
  companyName: string | null;
  email: string;
  phone: string | null;
  telegram: string | null;
  billingStatus: BillingStatus;
  contractNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  fullName: string;
  companyName?: string | null;
  email: string;
  phone?: string | null;
  telegram?: string | null;
  billingStatus?: BillingStatus;
  contractNumber?: string | null;
  notes?: string | null;
}

export type UpdateClientDto = Partial<CreateClientDto>;

export interface ClientListFilters {
  search?: string;
  billingStatus?: BillingStatus;
}

export interface ClientDocument {
  id: number;
  clientId: number;
  docType: DocumentType;
  fileName: string;
  relativePath: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface AttachDocumentResult {
  document: ClientDocument | null;
  canceled: boolean;
}

export type PremiereStatus = 'World' | 'International' | 'National' | 'None';

export type FilmStatus =
  | 'Draft'
  | 'Materials_Pending'
  | 'Ready_For_Submissions'
  | 'In_Submissions'
  | 'Completed';

export interface Film {
  id: number;
  clientId: number;
  titleOriginal: string;
  titleIntl: string | null;
  year: number;
  durationMin: number;
  genre: string | null;
  director: string;
  producer: string | null;
  synopsisShort: string | null;
  synopsisLong: string | null;
  premiereStatus: PremiereStatus;
  aspectRatio: string | null;
  soundFormat: string | null;
  screenerUrl: string | null;
  screenerPassword: string | null;
  subtitlesUrl: string | null;
  pressKitUrl: string | null;
  stillsFolderUrl: string | null;
  trailerUrl: string | null;
  dialogueListUrl: string | null;
  dcpCloudUrl: string | null;
  status: FilmStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFilmDto {
  clientId: number;
  titleOriginal: string;
  titleIntl?: string | null;
  year: number;
  durationMin: number;
  genre?: string | null;
  director: string;
  producer?: string | null;
  synopsisShort?: string | null;
  synopsisLong?: string | null;
  premiereStatus?: PremiereStatus;
  aspectRatio?: string | null;
  soundFormat?: string | null;
  screenerUrl?: string | null;
  screenerPassword?: string | null;
  subtitlesUrl?: string | null;
  pressKitUrl?: string | null;
  stillsFolderUrl?: string | null;
  trailerUrl?: string | null;
  dialogueListUrl?: string | null;
  dcpCloudUrl?: string | null;
  status?: FilmStatus;
}

export type UpdateFilmDto = Partial<Omit<CreateFilmDto, 'clientId'>>;

export interface FilmReadiness {
  score: number;
  isReady: boolean;
  missingRequired: string[];
  missingOptional: string[];
}

export type AccreditationType =
  | 'FIAPF_A'
  | 'Oscar_qualifying'
  | 'BAFTA'
  | 'ECFA'
  | 'EFA'
  | 'None';

export type SubmissionPlatform =
  | 'FilmFreeway'
  | 'Shortfilmdepot'
  | 'Festhome'
  | 'Direct'
  | 'Other';

export type SubmissionStatus =
  | 'Shortlist_Planned'
  | 'Client_Approved'
  | 'Submitted'
  | 'In_Review'
  | 'Selected'
  | 'Rejected'
  | 'Withdrawn'
  | 'Awarded';

export type PremiereRequirement =
  | 'World'
  | 'International'
  | 'National'
  | 'Regional'
  | 'No Requirement';

export type CurrencyType = 'USD' | 'EUR' | 'GBP' | 'RUB';

export type PaidBy = 'Agent' | 'Client';

export interface Festival {
  id: number;
  name: string;
  country: string;
  city: string | null;
  websiteUrl: string | null;
  accreditation: AccreditationType;
  platformDefault: SubmissionPlatform;
  notes: string | null;
  wikidataId: string | null;
  createdAt: string;
}

export interface FestivalEdition {
  id: number;
  festivalId: number;
  editionYear: number;
  startDate: string | null;
  endDate: string | null;
  earlyDeadline: string | null;
  regularDeadline: string | null;
  lateDeadline: string | null;
  notificationDate: string | null;
  premiereRequirement: PremiereRequirement;
}

export interface FestivalWithEditions extends Festival {
  editions: FestivalEdition[];
}

export interface FestivalHistoryEntry {
  submissionId: number;
  filmId: number;
  filmTitle: string;
  clientId: number;
  clientName: string;
  editionYear: number;
  status: SubmissionStatus;
  submissionFee: number;
  feeCurrency: CurrencyType;
  trackingCode: string | null;
  categoryName: string | null;
}

export interface FestivalDetailed extends FestivalWithEditions {
  history: FestivalHistoryEntry[];
}

export interface WikidataFestivalItem {
  qid: string;
  name: string;
  country: string | null;
  city: string | null;
  websiteUrl: string | null;
  alreadyImported: boolean;
}

export interface UpdateFestivalDto {
  name?: string;
  country?: string;
  city?: string | null;
  websiteUrl?: string | null;
  accreditation?: AccreditationType;
  platformDefault?: SubmissionPlatform;
  notes?: string | null;
}

export interface Submission {
  id: number;
  filmId: number;
  editionId: number;
  categoryName: string | null;
  platform: SubmissionPlatform;
  trackingCode: string | null;
  status: SubmissionStatus;
  submissionFee: number;
  feeCurrency: CurrencyType;
  paidBy: PaidBy;
  submissionDate: string | null;
  notificationDate: string | null;
  feedbackNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionWithDetails extends Submission {
  festivalId: number;
  festivalName: string;
  festivalCountry: string;
  festivalCity: string | null;
  festivalWebsiteUrl: string | null;
  editionYear: number;
  editionEarlyDeadline: string | null;
  editionRegularDeadline: string | null;
  editionLateDeadline: string | null;
  editionNotificationDate: string | null;
  editionPremiereRequirement: PremiereRequirement;
}

export interface SubmissionStats {
  total: number;
  submitted: number;
  inReview: number;
  selected: number;
  rejected: number;
  awarded: number;
  totalSpent: number;
}

export interface FestivalListFilters {
  search?: string;
  country?: string;
  accreditation?: AccreditationType;
}

export interface CreateFestivalDto {
  name: string;
  country: string;
  city?: string | null;
  websiteUrl?: string | null;
  accreditation?: AccreditationType;
  platformDefault?: SubmissionPlatform;
  notes?: string | null;
}

export interface CreateEditionDto {
  editionYear: number;
  startDate?: string | null;
  endDate?: string | null;
  earlyDeadline?: string | null;
  regularDeadline?: string | null;
  lateDeadline?: string | null;
  notificationDate?: string | null;
  premiereRequirement?: PremiereRequirement;
}

export interface CreateSubmissionDto {
  filmId: number;
  editionId: number;
  categoryName?: string | null;
  platform?: SubmissionPlatform;
  trackingCode?: string | null;
  status?: SubmissionStatus;
  submissionFee?: number;
  feeCurrency?: CurrencyType;
  paidBy?: PaidBy;
  submissionDate?: string | null;
  notificationDate?: string | null;
  feedbackNotes?: string | null;
}

export interface UpdateSubmissionDto {
  categoryName?: string | null;
  platform?: SubmissionPlatform;
  trackingCode?: string | null;
  submissionFee?: number;
  feeCurrency?: CurrencyType;
  paidBy?: PaidBy;
  submissionDate?: string | null;
  notificationDate?: string | null;
  feedbackNotes?: string | null;
}

export type InvoicePurpose = 'Agency_Fee' | 'Submission_Budget' | 'Package_Strategy' | 'Other';

export type InvoiceStatus = 'Pending' | 'Paid' | 'Cancelled';

export interface ClientInvoice {
  id: number;
  clientId: number;
  filmId: number | null;
  invoiceNumber: string;
  amount: number;
  currency: CurrencyType;
  purpose: InvoicePurpose;
  status: InvoiceStatus;
  dueDate: string | null;
  paidDate: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ClientFinancialSummary {
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  submissionDeposit: number;
  submissionSpent: number;
  depositBalance: number;
}

export interface CreateInvoiceDto {
  clientId: number;
  filmId?: number | null;
  invoiceNumber: string;
  amount: number;
  currency?: CurrencyType;
  purpose: InvoicePurpose;
  status?: InvoiceStatus;
  dueDate?: string | null;
  paidDate?: string | null;
  notes?: string | null;
}

export type CalendarEventType =
  | 'early_deadline'
  | 'regular_deadline'
  | 'late_deadline'
  | 'notification';

export interface CalendarEvent {
  id: string;
  submissionId: number;
  editionId: number;
  eventType: CalendarEventType;
  date: string;
  festivalName: string;
  festivalCountry: string;
  festivalCity: string | null;
  editionYear: number;
  filmId: number;
  filmTitle: string;
  clientId: number;
  clientName: string;
  platform: SubmissionPlatform;
  submissionStatus: SubmissionStatus;
  trackingCode: string | null;
  categoryName: string | null;
}

export interface CalendarEventsQuery {
  startDate: string;
  endDate: string;
  filmId?: number | null;
  clientId?: number | null;
}

export interface ReportExportResult {
  canceled: boolean;
  filePath: string | null;
}

export interface BackupResult {
  canceled: boolean;
  filePath: string | null;
}

export interface RestoreResult {
  canceled: boolean;
  restored: boolean;
  error?: string;
}

export interface Api {
  clients: {
    list: (filters?: ClientListFilters) => Promise<Client[]>;
    get: (id: number) => Promise<Client | null>;
    create: (dto: CreateClientDto) => Promise<Client>;
    update: (id: number, dto: UpdateClientDto) => Promise<Client>;
    delete: (id: number) => Promise<void>;
  };
  documents: {
    list: (clientId: number) => Promise<ClientDocument[]>;
    attach: (clientId: number, docType: DocumentType) => Promise<AttachDocumentResult>;
    open: (id: number) => Promise<void>;
    delete: (id: number) => Promise<void>;
  };
  films: {
    getByClientId: (clientId: number) => Promise<Film[]>;
    getById: (id: number) => Promise<Film | null>;
    create: (dto: CreateFilmDto) => Promise<Film>;
    update: (id: number, dto: UpdateFilmDto) => Promise<Film>;
    delete: (id: number) => Promise<void>;
    openExternalLink: (url: string) => Promise<void>;
  };
  festivals: {
    getAll: (filters?: FestivalListFilters) => Promise<Festival[]>;
    getById: (id: number) => Promise<FestivalWithEditions | null>;
    getByIdWithDetails: (id: number) => Promise<FestivalDetailed | null>;
    create: (dto: CreateFestivalDto) => Promise<Festival>;
    update: (id: number, data: UpdateFestivalDto) => Promise<Festival>;
    addEdition: (festivalId: number, dto: CreateEditionDto) => Promise<FestivalEdition>;
    searchWikidata: (query: string, limit?: number) => Promise<WikidataFestivalItem[]>;
    importWikidata: (item: WikidataFestivalItem) => Promise<Festival>;
    openExternal: (url: string) => Promise<void>;
  };
  submissions: {
    getByFilmId: (filmId: number) => Promise<SubmissionWithDetails[]>;
    create: (dto: CreateSubmissionDto) => Promise<SubmissionWithDetails>;
    updateStatus: (id: number, status: SubmissionStatus) => Promise<SubmissionWithDetails>;
    updateDetails: (id: number, dto: UpdateSubmissionDto) => Promise<SubmissionWithDetails>;
    delete: (id: number) => Promise<void>;
    getStats: (filmId: number) => Promise<SubmissionStats>;
  };
  invoices: {
    getByClientId: (clientId: number) => Promise<ClientInvoice[]>;
    create: (dto: CreateInvoiceDto) => Promise<ClientInvoice>;
    updateStatus: (
      id: number,
      status: InvoiceStatus,
      paidDate?: string | null
    ) => Promise<ClientInvoice>;
    delete: (id: number) => Promise<void>;
    getBalance: (clientId: number) => Promise<ClientFinancialSummary>;
  };
  calendar: {
    getEvents: (query: CalendarEventsQuery) => Promise<CalendarEvent[]>;
  };
  reports: {
    exportSubmissionsCsv: (filmId: number) => Promise<ReportExportResult>;
  };
  system: {
    exportBackup: () => Promise<BackupResult>;
    importBackup: () => Promise<RestoreResult>;
  };
}
