export function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString();
  }
  

// Define this outside your component or in your types file
export const getFormattedAnswers = (answers: Record<string, string>) => {
  const formattedAnswers = {
    ...answers,
    dateOfBirth: `${answers.dateOfBirth_year}-${answers.dateOfBirth_month}-${answers.dateOfBirth_day}`,
  };

  // We remove the split date parts so they aren't sent to the API
  delete (formattedAnswers as any).dateOfBirth_year;
  delete (formattedAnswers as any).dateOfBirth_month;
  delete (formattedAnswers as any).dateOfBirth_day;

  return formattedAnswers;
};
