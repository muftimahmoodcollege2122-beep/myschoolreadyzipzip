export interface SchoolTheme {
  template:       'classic' | 'modern' | 'bold' | 'elegant' | 'vibrant';
  primaryColor:   string;
  secondaryColor: string;
  accentColor:    string;
  textColor:      string;
  bgColor:        string;
  fontHeading:    string;
  fontBody:       string;
  heroStyle:      'centered' | 'split' | 'full-bg' | 'minimal' | 'diagonal';
  logoUrl:        string;
  logoShape:      'circle' | 'rounded' | 'square';
  borderRadius:   'none' | 'small' | 'medium' | 'large';
  shadowStyle:    'none' | 'soft' | 'medium' | 'strong';
  navStyle:       'solid' | 'transparent' | 'gradient' | 'outline';
  buttonStyle:    'solid' | 'outline' | 'pill' | 'sharp';
  schoolName:     string;
  tagline:        string;
  city:           string;
  phone:          string;
  email:          string;
  address:        string;
  established:    string;
  principalName:  string;
  coverImageUrl:  string;
  socialLinks:    { facebook?: string; twitter?: string; youtube?: string; instagram?: string };
  // Portal-controlled content & section visibility
  heroTitle?:      string;
  heroSubtitle?:   string;
  heroCtaText?:    string;
  aboutText?:      string;
  statsStudents?:  string;
  statsTeachers?:  string;
  statsYears?:     string;
  statsPassRate?:  string;
  sections?: {
    hero: boolean; about: boolean; stats: boolean; gallery: boolean;
    events: boolean; admissions: boolean; staff: boolean;
    testimonials: boolean; contact: boolean; news: boolean;
  };
}
