import React, { createContext, useContext, useState, useCallback } from "react";
import type { StudyPlanDto } from "../api/studyPlans";

interface StudyPlansContextType {
  studyPlans: StudyPlanDto[];
  setStudyPlans: React.Dispatch<React.SetStateAction<StudyPlanDto[]>>;
  addStudyPlan: (plan: StudyPlanDto) => void;
  removeStudyPlan: (planId: number) => void;
  updateStudyPlan: (planId: number, updates: Partial<StudyPlanDto>) => void;
}

const StudyPlansContext = createContext<StudyPlansContextType | undefined>(
  undefined
);

export const StudyPlansProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [studyPlans, setStudyPlans] = useState<StudyPlanDto[]>([]);

  const addStudyPlan = useCallback((plan: StudyPlanDto) => {
    setStudyPlans((prev) => [plan, ...prev]);
  }, []);

  const removeStudyPlan = useCallback((planId: number) => {
    setStudyPlans((prev) => prev.filter((plan) => plan.id !== planId));
  }, []);

  const updateStudyPlan = useCallback(
    (planId: number, updates: Partial<StudyPlanDto>) => {
      setStudyPlans((prev) =>
        prev.map((plan) =>
          plan.id === planId ? { ...plan, ...updates } : plan
        )
      );
    },
    []
  );

  return (
    <StudyPlansContext.Provider
      value={{
        studyPlans,
        setStudyPlans,
        addStudyPlan,
        removeStudyPlan,
        updateStudyPlan,
      }}
    >
      {children}
    </StudyPlansContext.Provider>
  );
};

export const useStudyPlans = () => {
  const context = useContext(StudyPlansContext);
  if (!context) {
    throw new Error("useStudyPlans must be used within StudyPlansProvider");
  }
  return context;
};
