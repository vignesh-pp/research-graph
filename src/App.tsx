import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { DashboardPage } from "@/pages/Dashboard";
import { PapersPage } from "@/pages/Papers";
import { PaperDetailsPage } from "@/pages/PaperDetails";
import { ResearchersPage } from "@/pages/Researchers";
import { ResearcherDetailsPage } from "@/pages/ResearcherDetails";
import { TopicsPage } from "@/pages/Topics";
import { TopicDetailsPage } from "@/pages/TopicDetails";
import { InstitutionsPage } from "@/pages/Institutions";
import { InstitutionDetailsPage } from "@/pages/InstitutionDetails";
import { MethodsPage } from "@/pages/Methods";
import { DatasetsPage } from "@/pages/Datasets";
import { GraphExplorerPage } from "@/pages/GraphExplorer";
import { PathFinderPage } from "@/pages/PathFinder";
import { SearchPage } from "@/pages/Search";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/papers" element={<PapersPage />} />
          <Route path="/papers/:id" element={<PaperDetailsPage />} />
          <Route path="/researchers" element={<ResearchersPage />} />
          <Route path="/researchers/:id" element={<ResearcherDetailsPage />} />
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/topics/:id" element={<TopicDetailsPage />} />
          <Route path="/institutions" element={<InstitutionsPage />} />
          <Route path="/institutions/:id" element={<InstitutionDetailsPage />} />
          <Route path="/methods" element={<MethodsPage />} />
          <Route path="/datasets" element={<DatasetsPage />} />
          <Route path="/graph" element={<GraphExplorerPage />} />
          <Route path="/explorer" element={<GraphExplorerPage />} />
          <Route path="/path" element={<PathFinderPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
