import { PaperRepository } from "../repositories/paper.repository.js";

export class PaperService {
  private paperRepo = new PaperRepository();

  async getPapers(params: {
    search?: string;
    year?: number;
    topicId?: string;
    methodId?: string;
    datasetId?: string;
    page?: number;
    pageSize?: number;
  }) {
    return this.paperRepo.findFiltered(params);
  }

  async getPaperDetails(id: string) {
    const paper = await this.paperRepo.findById(id);
    if (!paper) return null;

    const [authors, topics, methods, datasets, citations, related, lineage] = await Promise.all([
      this.paperRepo.getAuthors(id),
      this.paperRepo.getTopics(id),
      this.paperRepo.getMethods(id),
      this.paperRepo.getDatasets(id),
      this.paperRepo.getCitations(id),
      this.paperRepo.getRelatedPapers(id, 6),
      this.paperRepo.getLineage(id, 3),
    ]);

    return {
      paper,
      authors,
      topics,
      methods,
      datasets,
      citations,
      related,
      lineage,
    };
  }

  async getPaperById(id: string) {
    return this.paperRepo.findById(id);
  }

  async getPaperAuthors(id: string) {
    return this.paperRepo.getAuthors(id);
  }

  async getPaperTopics(id: string) {
    return this.paperRepo.getTopics(id);
  }

  async getPaperMethods(id: string) {
    return this.paperRepo.getMethods(id);
  }

  async getPaperDatasets(id: string) {
    return this.paperRepo.getDatasets(id);
  }

  async getPaperCitations(id: string) {
    return this.paperRepo.getCitations(id);
  }

  async getPaperLineage(id: string, depth: number = 3) {
    return this.paperRepo.getLineage(id, depth);
  }

  async getRelatedPapers(id: string, limit: number = 6) {
    return this.paperRepo.getRelatedPapers(id, limit);
  }
}
