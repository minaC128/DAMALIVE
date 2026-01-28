
/**
 * Date utilities for pregnancy calculations
 */

export const PREGNANCY_DAYS = 280;

export const calculatePregnancyProgress = (startDateStr: string | null) => {
  if (!startDateStr) return { weeks: 14, days: 3 };

  const start = new Date(startDateStr);
  const now = new Date();
  
  const diffTime = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Ensure we don't return negative values
  const totalDays = Math.max(0, diffDays);
  const weeks = Math.floor(totalDays / 7);
  const days = totalDays % 7;
  
  return { weeks, days, totalDays };
};

export const calculateDueDateFromLMP = (lmpStr: string): string => {
  const lmp = new Date(lmpStr);
  const dueDate = new Date(lmp);
  dueDate.setDate(lmp.getDate() + PREGNANCY_DAYS);
  return dueDate.toISOString().split('T')[0];
};

export const calculateLMPFromDueDate = (dueDateStr: string): string => {
  const dueDate = new Date(dueDateStr);
  const lmp = new Date(dueDate);
  lmp.setDate(dueDate.getDate() - PREGNANCY_DAYS);
  return lmp.toISOString().split('T')[0];
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
