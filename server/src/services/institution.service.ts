import { InstitutionRepository } from "../repositories/institution.repository.js";

export class InstitutionService {
  private institutionRepo = new InstitutionRepository();

  async getAllInstitutions() {
    return this.institutionRepo.findAll();
  }

  async getInstitutionDetails(id: string) {
    const institution = await this.institutionRepo.findById(id);
    if (!institution) return null;

    const [researchers, papers, collaborations] = await Promise.all([
      this.institutionRepo.getResearchers(id),
      this.institutionRepo.getPapers(id),
      this.institutionRepo.getCollaborations(id),
    ]);

    return {
      institution,
      researchers,
      papers,
      collaborations,
    };
  }

  async getInstitutionById(id: string) {
    return this.institutionRepo.findById(id);
  }
}
