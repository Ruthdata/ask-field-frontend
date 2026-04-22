import StepOne from "@components/Dashboard/researcher/survey/create-survey-steps/StepOne";
import StepTwo, {
  FieldConfig,
} from "@components/Dashboard/researcher/survey/create-survey-steps/StepTwo";
import StepThree from "@components/Dashboard/researcher/survey/create-survey-steps/StepThree";
import StepFour from "@components/Dashboard/researcher/survey/create-survey-steps/StepFour";
import StepFive from "@components/Dashboard/researcher/survey/create-survey-steps/StepFive";
import { useGetProjectByIdQuery } from "@/redux/api/projectApi";
import {
  useCreateDraftSurveyMutation,
  useGetUserSurveyQuery,
  usePublishDraftSurveyMutation,
  useUpdateDraftSurveyMutation,
} from "@/redux/api/surveyApi";
import { formatApiError } from "@/utils/helper";
import {
  CompletionPath,
  CreateDraftSurveyResponse,
  StudyLabelOption,
  Survey,
  SurveyResponse,
  SurveyFormData,
  SurveyStepThreeData,
} from "@/types/survey";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

const totalSteps = 5;

const stepTwoField: FieldConfig[] = [
  {
    name: "surveyName",
    label: "Study Name",
    placeholder: "Enter study name",
    isRequired: true,
    type: "text",
  },
  {
    name: "internalSurveyName",
    label: "Internal Study Name",
    placeholder: "Enter internal study name",
    type: "text",
  },
  {
    name: "surveyDescription",
    label: "Description of Study",
    isRequired: true,
    type: "textarea",
    fullWidth: true,
    placeholder: "Describe what participants should expect in this study",
  },
  {
    name: "contentWarning",
    label: "Content Warning",
    isRequired: true,
    type: "textarea",
    fullWidth: true,
    placeholder:
      "Enter any sensitive topics participants should know about, or type None if not applicable",
  },
];

const createEmptyCompletionPath = (index: number): CompletionPath => ({
  id: `path-${index}`,
  name: index === 1 ? "Default Path" : `Path ${index}`,
  handleSubmission: "",
  addToParticipantGroup: "general",
  redirectUrl: "",
  completionCode: `ASK${String(index).padStart(4, "0")}`,
});

const initialFormData: SurveyFormData = {
  surveyType: null,
  stepTwoData: {
    surveyName: "",
    internalSurveyName: "",
    surveyDescription: "",
    contentWarning: "",
    surveyLabel: "",
    usableDevices: [],
    surveyEquipment: "",
  },
  stepThreeData: {
    surveyURL: "",
    toRecordId: "",
    completionPaths: [createEmptyCompletionPath(1)],
  },
  stepFourData: {
    howToFindParticipant: "",
    numberOfParticipants: "",
    howToScreenParticipants: "",
    surveyDistribution: "",
    surveyCrendentials: "",
    totalSubmission: "",
    inputRejection: "",
  },
  stepFiveData: {
    surveyDuration: "",
    surveyAmount: "",
  },
};

const getGeneratedPathData = (
  projectId: string,
  surveyId: string,
  pathIndex: number,
) => {
  const baseUrl =
    import.meta.env.VITE_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");

  return {
    redirectUrl: `${baseUrl}/dashboard/researcher/projects/${projectId}/surveys/${surveyId}/complete?path=${pathIndex}`,
    completionCode: `ASK${surveyId.slice(-4).toUpperCase()}${pathIndex}`,
  };
};

const syncCompletionPaths = (
  stepThreeData: SurveyStepThreeData,
  projectId: string,
  surveyId: string,
): SurveyStepThreeData => ({
  ...stepThreeData,
  completionPaths: stepThreeData.completionPaths.map((path, index) => ({
    ...path,
    ...getGeneratedPathData(projectId, surveyId, index + 1),
  })),
});

const extractSurveyId = (response: CreateDraftSurveyResponse) => {
  if (response.success === false) {
    throw new Error(
      response.error || response.message || "Unable to create draft survey.",
    );
  }

  const surveyId =
    response?.data?.surveyId || response?.data?._id || response?.data?.id;

  if (!surveyId) {
    throw new Error("Draft survey was created without a valid survey id.");
  }

  return surveyId;
};

const getSurveyIdentifier = (survey: Partial<Survey>) =>
  survey.surveyId || survey._id || "";

const createCompletionPathFromSurvey = (survey: Survey): CompletionPath => ({
  ...createEmptyCompletionPath(1),
  handleSubmission: survey.handleSubmission || "",
  addToParticipantGroup: survey.addToParticipantGroup || "general",
});

const mapSurveyToFormData = (
  survey: Survey,
  projectId: string,
): SurveyFormData => {
  const validStudyLabels: StudyLabelOption[] = [
    "survey",
    "decision making",
    "writing",
    "interview",
    "ai task",
    "none",
  ];
  const surveyId = getSurveyIdentifier(survey);
  const completionPath = createCompletionPathFromSurvey(survey);
  const stepThreeData =
    surveyId && projectId
      ? syncCompletionPaths(
          {
            surveyURL: survey.surveyURL || "",
            toRecordId: survey.toRecordId || "",
            completionPaths: [completionPath],
          },
          projectId,
          surveyId,
        )
      : {
          surveyURL: survey.surveyURL || "",
          toRecordId: survey.toRecordId || "",
          completionPaths: [completionPath],
        };

  return {
    surveyType:
      survey.surveyType === "external" || survey.surveyType === "aiTaskBuilder"
        ? survey.surveyType
        : null,
    draftSurveyId: surveyId || undefined,
    stepTwoData: {
      surveyName: survey.surveyName || "",
      internalSurveyName: survey.internalSurveyName || "",
      surveyDescription: survey.surveyDescription || "",
      contentWarning: survey.contentWarning || "",
      surveyLabel: validStudyLabels.includes(
        survey.surveyLabel as StudyLabelOption,
      )
        ? (survey.surveyLabel as StudyLabelOption)
        : "",
      usableDevices: survey.usableDevices || [],
      surveyEquipment: survey.surveyEquipment || "",
    },
    stepThreeData,
    stepFourData: {
      howToFindParticipant: survey.howToFindParticipant || "",
      numberOfParticipants:
        survey.numberOfParticipants !== undefined
          ? String(survey.numberOfParticipants)
          : "",
      howToScreenParticipants: survey.howToScreenParticipants || "",
      surveyDistribution: survey.surveyDistribution || "",
      surveyCrendentials: survey.surveyCrendentials || "",
      totalSubmission:
        survey.totalSubmission !== undefined
          ? String(survey.totalSubmission)
          : "",
      inputRejection:
        survey.inputRejection !== undefined
          ? String(survey.inputRejection)
          : "",
    },
    stepFiveData: {
      surveyDuration:
        survey.surveyDuration !== undefined
          ? String(survey.surveyDuration)
          : "",
      surveyAmount:
        survey.surveyAmount !== undefined ? String(survey.surveyAmount) : "",
    },
  };
};

const buildSurveyPayload = (
  formData: SurveyFormData,
  projectId: string,
  uptoStep: number,
): Record<string, unknown> => {
  const primaryPath = formData.stepThreeData.completionPaths[0];

  const body: Record<string, unknown> = {
    projectId,
  };

  if (uptoStep >= 1 && formData.surveyType) {
    body.surveyType = formData.surveyType;
  }

  if (uptoStep >= 2) {
    body.surveyName = formData.stepTwoData.surveyName.trim();
    body.internalSurveyName = formData.stepTwoData.internalSurveyName.trim();
    body.surveyDescription = formData.stepTwoData.surveyDescription.trim();
    body.contentWarning = formData.stepTwoData.contentWarning.trim();
    body.surveyLabel = formData.stepTwoData.surveyLabel;
    body.usableDevices = formData.stepTwoData.usableDevices;
    body.surveyEquipment = formData.stepTwoData.surveyEquipment;
  }

  if (uptoStep >= 3) {
    body.surveyURL = formData.stepThreeData.surveyURL.trim();
    body.toRecordId = formData.stepThreeData.toRecordId;
    body.handleSubmission = primaryPath?.handleSubmission || "";
    body.addToParticipantGroup = primaryPath?.addToParticipantGroup || "";
  }

  if (uptoStep >= 4) {
    body.howToFindParticipant = formData.stepFourData.howToFindParticipant;
    body.howToScreenParticipants =
      formData.stepFourData.howToScreenParticipants;
    body.surveyDistribution = formData.stepFourData.surveyDistribution;
    body.surveyCrendentials = formData.stepFourData.surveyCrendentials;

    if (formData.stepFourData.numberOfParticipants !== "") {
      body.numberOfParticipants = Number(
        formData.stepFourData.numberOfParticipants,
      );
    }

    if (formData.stepFourData.totalSubmission !== "") {
      body.totalSubmission = Number(formData.stepFourData.totalSubmission);
    }

    if (formData.stepFourData.inputRejection !== "") {
      body.inputRejection = Number(formData.stepFourData.inputRejection);
    }
  }

  if (uptoStep >= 5) {
    if (formData.stepFiveData.surveyDuration !== "") {
      body.surveyDuration = Number(formData.stepFiveData.surveyDuration);
    }

    if (formData.stepFiveData.surveyAmount !== "") {
      body.surveyAmount = Number(formData.stepFiveData.surveyAmount);
    }
  }

  return body;
};

const getMissingPublishFields = (survey: Partial<Survey>) => {
  const missing: string[] = [];

  if (!survey.surveyType) missing.push("study type");
  if (!survey.surveyName) missing.push("study name");
  if (!survey.surveyDescription) missing.push("study description");
  if (!survey.contentWarning) missing.push("content warning");
  if (!survey.surveyLabel) missing.push("study label");
  if (!survey.usableDevices || survey.usableDevices.length === 0) {
    missing.push("usable devices");
  }
  if (!survey.surveyEquipment) missing.push("study requirement");
  if (!survey.surveyURL) missing.push("study URL");
  if (!survey.toRecordId) missing.push("record ID method");
  if (!survey.handleSubmission) missing.push("submission handling");
  if (!survey.addToParticipantGroup) missing.push("participant group");
  if (!survey.howToFindParticipant) missing.push("participant source");
  if (!survey.howToScreenParticipants) missing.push("screening");
  if (!survey.surveyDistribution) missing.push("distribution");
  if (!survey.surveyCrendentials) missing.push("credentials");
  if (!survey.numberOfParticipants || survey.numberOfParticipants <= 0) {
    missing.push("number of participants");
  }
  if (!survey.totalSubmission || survey.totalSubmission <= 0) {
    missing.push("submission limit");
  }
  if (!survey.surveyDuration || survey.surveyDuration <= 0) {
    missing.push("study duration");
  }
  if (!survey.surveyAmount || survey.surveyAmount <= 0) {
    missing.push("study payment");
  }

  return missing;
};

const CreateSurvey = () => {
  const navigate = useNavigate();
  const { id: projectId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<SurveyFormData>(initialFormData);
  const [hydratedSurveyId, setHydratedSurveyId] = useState<string | null>(null);
  const editSurveyId = searchParams.get("surveyId")?.trim() || "";
  const isEditingDraft = Boolean(editSurveyId);

  const { data: projectData } = useGetProjectByIdQuery(projectId, {
    skip: !projectId,
  });
  const project = projectData?.data;
  const {
    data: surveyToEditResponse,
    isLoading: isLoadingSurveyToEdit,
    isError: isSurveyToEditError,
    refetch: refetchSurveyToEdit,
  } = useGetUserSurveyQuery(editSurveyId, {
    skip: !editSurveyId,
  });
  const surveyToEdit = surveyToEditResponse?.data;

  const [createDraftSurvey, { isLoading: isCreatingDraft }] =
    useCreateDraftSurveyMutation();
  const [updateDraftSurvey, { isLoading: isUpdatingDraft }] =
    useUpdateDraftSurveyMutation();
  const [publishDraftSurvey, { isLoading: isPublishingDraft }] =
    usePublishDraftSurveyMutation();

  const isSaving = isCreatingDraft || isUpdatingDraft;
  const isSubmitting = isSaving || isPublishingDraft;

  useEffect(() => {
    if (!isEditingDraft || !surveyToEdit || hydratedSurveyId === editSurveyId) {
      return;
    }

    if (surveyToEdit.status !== "draft") {
      toast.error(
        "Only draft surveys can be updated from this page right now.",
      );
      navigate(`/dashboard/researcher/projects/${projectId}`);
      return;
    }

    setFormData(mapSurveyToFormData(surveyToEdit, projectId));
    setHydratedSurveyId(editSurveyId);
  }, [
    editSurveyId,
    hydratedSurveyId,
    isEditingDraft,
    navigate,
    projectId,
    surveyToEdit,
  ]);

  const updateFormData = (data: Partial<SurveyFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateStep = (stepNumber: number) => {
    if (stepNumber === 1 && !formData.surveyType) {
      return "Please choose how you want to collect data.";
    }

    if (stepNumber === 2) {
      if (!formData.stepTwoData.surveyName.trim()) {
        return "Please enter the study name.";
      }

      if (!formData.stepTwoData.surveyDescription.trim()) {
        return "Please enter the study description.";
      }

      if (!formData.stepTwoData.contentWarning.trim()) {
        return "Please enter a content warning or type None if it does not apply.";
      }

      if (!formData.stepTwoData.surveyLabel) {
        return "Please choose a study label.";
      }

      if (formData.stepTwoData.usableDevices.length === 0) {
        return "Please select at least one usable device.";
      }

      if (!formData.stepTwoData.surveyEquipment) {
        return "Please choose a study requirement.";
      }
    }

    if (stepNumber === 3) {
      const primaryPath = formData.stepThreeData.completionPaths[0];

      if (!formData.stepThreeData.surveyURL.trim()) {
        return "Please enter the study URL.";
      }

      if (!formData.stepThreeData.toRecordId) {
        return "Please choose how AskField IDs should be recorded.";
      }

      if (!primaryPath?.handleSubmission) {
        return "Please choose how submissions should be processed.";
      }

      if (!primaryPath?.addToParticipantGroup) {
        return "Please choose a participant group.";
      }
    }

    if (stepNumber === 4) {
      const participants = Number(formData.stepFourData.numberOfParticipants);

      if (!formData.stepFourData.howToFindParticipant) {
        return "Please choose how you want to find participants.";
      }

      if (!participants || participants <= 0) {
        return "Please enter the number of participants.";
      }

      if (!formData.stepFourData.howToScreenParticipants) {
        return "Please choose a screening option.";
      }

      if (!formData.stepFourData.surveyDistribution) {
        return "Please choose how the study should be distributed.";
      }

      if (!formData.stepFourData.surveyCrendentials) {
        return "Please choose whether login credentials are required.";
      }

      if (!formData.stepFourData.totalSubmission) {
        return "Please choose how many times participants can complete the study.";
      }

      if (formData.stepFourData.inputRejection === "") {
        return "Please choose an input rejection rule.";
      }
    }

    if (stepNumber === 5) {
      const duration = Number(formData.stepFiveData.surveyDuration);
      const amount = Number(formData.stepFiveData.surveyAmount);

      if (!duration || duration <= 0) {
        return "Please enter the study duration.";
      }

      if (!amount || amount <= 0) {
        return "Please enter how much you want to pay.";
      }
    }

    return null;
  };

  const ensureDraft = async () => {
    if (!projectId) {
      throw new Error("Missing project id.");
    }

    if (formData.draftSurveyId) {
      return formData.draftSurveyId;
    }

    const response = await createDraftSurvey({
      projectId,
      surveyName: formData.stepTwoData.surveyName.trim() || "Untitled Study",
    }).unwrap();

    const surveyId = extractSurveyId(response);

    setFormData((prev) => ({
      ...prev,
      draftSurveyId: surveyId,
      stepThreeData: syncCompletionPaths(
        prev.stepThreeData,
        projectId,
        surveyId,
      ),
    }));

    return surveyId;
  };

  const persistDraft = async (
    uptoStep: number,
    showToast = false,
  ): Promise<{ surveyId: string; survey?: Survey }> => {
    const surveyId = await ensureDraft();
    const body = buildSurveyPayload(formData, projectId, uptoStep);

    if (uptoStep === 5) {
      console.warn("Persisting draft survey payload.", {
        surveyId,
        body,
      });
    }

    if (Object.keys(body).length <= 1) {
      if (showToast) {
        toast.success("Draft saved successfully.");
      }
      return { surveyId };
    }

    const response: SurveyResponse = await updateDraftSurvey({
      surveyId,
      body,
    }).unwrap();

    if (showToast) {
      toast.success("Draft saved successfully.");
    }

    return { surveyId, survey: response.data };
  };

  const handleNext = async () => {
    const error = validateStep(step);

    if (error) {
      toast.error(error);
      return;
    }

    try {
      await persistDraft(step);
      setStep((prev) => Math.min(prev + 1, totalSteps));
    } catch (error) {
      toast.error(formatApiError(error));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSaveDraft = async () => {
    try {
      await persistDraft(step, true);
      navigate(`/dashboard/researcher/projects/${projectId}`);
    } catch (error) {
      toast.error(formatApiError(error));
    }
  };

  const handlePreview = () => {
    toast("Preview as participant is not available yet.");
  };

  const handlePublish = async () => {
    for (let stepNumber = 1; stepNumber <= totalSteps; stepNumber += 1) {
      const error = validateStep(stepNumber);

      if (error) {
        toast.error(error);
        return;
      }
    }

    try {
      const publishPayload = buildSurveyPayload(
        formData,
        projectId,
        5,
      ) as Partial<Survey>;
      const missingFields = getMissingPublishFields(publishPayload);

      if (missingFields.length > 0) {
        toast.error(
          `Please complete these fields before publishing: ${missingFields.join(
            ", ",
          )}.`,
        );
        return;
      }

      const { surveyId, survey } = await persistDraft(5);

      if (
        survey &&
        (survey.numberOfParticipants !== publishPayload.numberOfParticipants ||
          survey.totalSubmission !== publishPayload.totalSubmission ||
          survey.inputRejection !== publishPayload.inputRejection ||
          survey.surveyDuration !== publishPayload.surveyDuration ||
          survey.surveyAmount !== publishPayload.surveyAmount)
      ) {
        console.warn(
          "Draft save response does not match the local publish payload.",
          {
            publishPayload,
            surveyResponse: survey,
          },
        );
      }

      const response = await publishDraftSurvey(surveyId).unwrap();
      toast.success(response.message || "Study created successfully.");
      navigate(`/dashboard/researcher/projects/${projectId}`);
    } catch (error) {
      toast.error(formatApiError(error));
    }
  };

  const participantCount =
    Number(formData.stepFourData.numberOfParticipants) || 0;
  const duration = Number(formData.stepFiveData.surveyDuration) || 1;
  const amount = Number(formData.stepFiveData.surveyAmount) || 0;
  const subtotal = participantCount * amount;
  const platformFee = subtotal > 0 ? 5 : 0;
  const vat = subtotal > 0 ? 5 : 0;
  const total = subtotal + platformFee + vat;

  if (
    isEditingDraft &&
    isLoadingSurveyToEdit &&
    hydratedSurveyId !== editSurveyId
  ) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 sm:px-3 lg:px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-5 text-sm text-gray-600">
            <Link
              to="/dashboard/researcher/projects"
              className="hover:underline"
            >
              My Projects
            </Link>
            {" / "}
            <Link
              to={`/dashboard/researcher/projects/${projectId}`}
              className="hover:underline"
            >
              {project?.title || "Project"}
            </Link>
            {" / "}
            <span className="text-yellow-500">Edit Study</span>
          </div>

          <div className="rounded-2xl bg-white px-6 py-10 shadow-sm">
            <p className="text-sm text-gray-500">Loading draft survey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditingDraft && isSurveyToEditError) {
    return (
      <div className="min-h-screen bg-gray-50 px-2 sm:px-3 lg:px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-5 text-sm text-gray-600">
            <Link
              to="/dashboard/researcher/projects"
              className="hover:underline"
            >
              My Projects
            </Link>
            {" / "}
            <Link
              to={`/dashboard/researcher/projects/${projectId}`}
              className="hover:underline"
            >
              {project?.title || "Project"}
            </Link>
            {" / "}
            <span className="text-yellow-500">Edit Study</span>
          </div>

          <div className="rounded-2xl bg-white px-6 py-10 shadow-sm">
            <p className="text-sm text-red-500">
              We couldn&apos;t load this draft survey right now.
            </p>
            <button
              type="button"
              onClick={() => refetchSurveyToEdit()}
              className="mt-4 rounded-3xl border border-gray-300 px-4 py-2 text-sm text-gray-700 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-3 lg:px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-5 text-sm text-gray-600">
          <Link to="/dashboard/researcher/projects" className="hover:underline">
            My Projects
          </Link>
          {" / "}
          <Link
            to={`/dashboard/researcher/projects/${projectId}`}
            className="hover:underline"
          >
            {project?.title || "Project"}
          </Link>
          {" / "}
          <span className="text-yellow-500">
            {isEditingDraft ? "Edit Study" : "New Study"}
          </span>
        </div>

        <div className="flex flex-col xl:flex-row gap-5">
          <div className="flex-[2.4]">
            {step === 1 && (
              <StepOne
                selected={formData.surveyType}
                setSelected={(surveyType) => updateFormData({ surveyType })}
                step={step}
                totalSteps={totalSteps}
                onNext={handleNext}
                isSubmitting={isSaving}
              />
            )}

            {step === 2 && (
              <StepTwo
                stepTwoData={formData.stepTwoData}
                setStepTwoData={(stepTwoData) =>
                  updateFormData({ stepTwoData })
                }
                step={step}
                totalSteps={totalSteps}
                onNext={handleNext}
                onBack={handleBack}
                fields={stepTwoField}
                isSubmitting={isSaving}
              />
            )}

            {step === 3 && (
              <StepThree
                stepData={formData.stepThreeData}
                setStepData={(stepThreeData) =>
                  updateFormData({ stepThreeData })
                }
                step={step}
                totalSteps={totalSteps}
                onBack={handleBack}
                onNext={handleNext}
                isSubmitting={isSaving}
              />
            )}

            {step === 4 && (
              <StepFour
                stepData={formData.stepFourData}
                setStepData={(stepFourData) => updateFormData({ stepFourData })}
                step={step}
                totalSteps={totalSteps}
                onBack={handleBack}
                onNext={handleNext}
                isSubmitting={isSaving}
              />
            )}

            {step === 5 && (
              <StepFive
                stepData={formData.stepFiveData}
                setStepData={(stepFiveData) => updateFormData({ stepFiveData })}
                step={step}
                totalSteps={totalSteps}
                onBack={handleBack}
                onSubmit={handlePublish}
                isSubmitting={isSubmitting}
              />
            )}
          </div>

          <aside className="xl:w-[290px] shadow-lg bg-white rounded-2xl px-4 py-6 h-fit">
            <h3 className="font-bold text-lg mb-4">Cost Breakdown</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">No. of Participants</span>
                <span className="font-semibold">{participantCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Study Duration</span>
                <span className="font-semibold">{duration} min</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Cost/Participants</span>
                <span className="font-semibold">${amount} USD</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="font-medium">Total</span>
                <span className="font-semibold">
                  ${subtotal.toLocaleString()} USD
                </span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Platform Fee</span>
                <span className="font-semibold">${platformFee} USD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">VAT</span>
                <span className="font-semibold">${vat} USD</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="font-medium">Total</span>
                <span className="font-semibold">
                  ${total.toLocaleString()} USD
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="w-full rounded-3xl bg-gray-100 font-medium py-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save as draft"}
              </button>
              <button
                onClick={handlePreview}
                className="w-full rounded-3xl border border-gray-700 font-medium py-3 cursor-pointer"
              >
                Preview as participant
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CreateSurvey;
