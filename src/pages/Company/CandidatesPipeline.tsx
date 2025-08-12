import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidatePipelineBoard } from "@/components/company/pipeline/CandidatePipelineBoard";

const CandidatesPipelinePage: React.FC = () => {
  return (
    <div className="p-3 md:p-6 min-h-screen bg-background max-w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Candidate Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <CandidatePipelineBoard />
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidatesPipelinePage;
