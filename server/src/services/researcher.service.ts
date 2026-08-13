import { ResearcherRepository } from "../repositories/researcher.repository.js";

export class ResearcherService {
  private researcherRepo = new ResearcherRepository();

  async getResearchers(params: {
    search?: string;
    institutionId?: string;
    topicId?: string;
    page?: number;
    pageSize?: number;
  }) {
    return this.researcherRepo.findFiltered(params);
  }

  async getResearcherDetails(id: string) {
    const researcher = await this.researcherRepo.findById(id);
    if (!researcher) return null;

    const [institution, papers, collaborators, collabGraph, topics, methods, datasets, projects] =
      await Promise.all([
        this.researcherRepo.getAffiliatedInstitution(id),
        this.researcherRepo.getAuthoredPapers(id),
        this.researcherRepo.getCollaborators(id),
        this.researcherRepo.getCollaborationNetwork(id),
        this.researcherRepo.getTopics(id),
        this.researcherRepo.getMethods(id),
        this.researcherRepo.getDatasets(id),
        this.researcherRepo.getProjects(id),
      ]);

    return {
      researcher,
      institution,
      papers,
      collaborators,
      collaborationGraph: collabGraph,
      topics,
      methods,
      datasets,
      projects,
    };
  }

  async getResearcherById(id: string) {
    return this.researcherRepo.findById(id);
  }

  async getCollaborators(id: string) {
    return this.researcherRepo.getCollaborators(id);
  }

  async getCollaborationGraph(id: string) {
    return this.researcherRepo.getCollaborationNetwork(id);
  }
}
