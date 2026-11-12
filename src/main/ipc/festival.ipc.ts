import { ipcMain, shell } from 'electron';
import type {
  AccreditationType,
  CreateEditionInput,
  CreateFestivalInput,
  FestivalRepository,
  UpdateFestivalInput
} from '../database/repositories/festival.repo';
import { searchFestivals, type WikidataFestivalItem } from '../services/wikidata.service';

export interface FestivalListFilters {
  search?: string;
  country?: string;
  accreditation?: AccreditationType;
}

export interface WikidataSearchResultItem extends WikidataFestivalItem {
  alreadyImported: boolean;
}

function isValidExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function registerFestivalHandlers(repo: FestivalRepository): void {
  ipcMain.handle('festivals:getAll', (_event, filters?: FestivalListFilters) =>
    repo.getAll(filters?.search, filters?.country, filters?.accreditation)
  );

  ipcMain.handle('festivals:getById', (_event, id: number) => repo.getByIdWithEditions(id));

  ipcMain.handle('festivals:getByIdWithDetails', (_event, id: number) =>
    repo.getByIdWithDetails(id)
  );

  ipcMain.handle('festivals:create', (_event, dto: CreateFestivalInput) => repo.create(dto));

  ipcMain.handle('festivals:update', (_event, id: number, dto: UpdateFestivalInput) =>
    repo.update(id, dto)
  );

  ipcMain.handle('festivals:addEdition', (_event, festivalId: number, dto: CreateEditionInput) =>
    repo.addEdition(festivalId, dto)
  );

  ipcMain.handle(
    'festivals:searchWikidata',
    async (_event, query: string, limit?: number): Promise<WikidataSearchResultItem[]> => {
      const items = await searchFestivals(query, limit ?? 25);
      const existing = new Set(repo.getExistingWikidataIds());
      return items.map((item) => ({ ...item, alreadyImported: existing.has(item.qid) }));
    }
  );

  ipcMain.handle('festivals:importWikidata', (_event, item: WikidataFestivalItem) =>
    repo.importFromWikidata(item)
  );

  ipcMain.handle('festivals:openExternal', async (_event, url: string) => {
    if (!isValidExternalUrl(url)) {
      throw new Error(`Недопустимая ссылка: ${url}`);
    }
    await shell.openExternal(url);
  });
}
