export interface ResumeEducation {
  school: string;
  major: string;
  degree: string;
  time: string;
}

export interface ResumeExperience {
  company: string;
  role: string;
  time: string;
  desc: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  targetRole: string;
  education: ResumeEducation[];
  experience: ResumeExperience[];
  skills: string[];
  intro: string;
}

export const DEFAULT_RESUME: ResumeData = {
  name: "",
  email: "",
  phone: "",
  targetRole: "",
  education: [{ school: "", major: "", degree: "", time: "" }],
  experience: [{ company: "", role: "", time: "", desc: "" }],
  skills: [],
  intro: "",
};
