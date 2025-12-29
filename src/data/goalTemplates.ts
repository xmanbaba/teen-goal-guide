import { GoalCategory } from '@/hooks/useGoals';

export interface GoalTemplate {
  id: string;
  category: GoalCategory;
  title: string;
  smartGoal: string;
  icon: string;
  whyReasons: string[];
  actionSteps: string[];
  barriers: string[];
  sacrifices: string[];
  excitingStatement: string;
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  // Academics
  {
    id: 'improve-grades',
    category: 'academics',
    title: 'Improve My GPA',
    smartGoal: 'I will raise my GPA by 0.5 points by the end of this semester by studying at least 2 hours daily and attending all classes.',
    icon: '📈',
    whyReasons: [
      'Better college opportunities',
      'Make my family proud',
      'Build good study habits for the future',
      'Qualify for scholarships',
      'Prove to myself I can do it',
    ],
    actionSteps: [
      'Create a study schedule and stick to it',
      'Join or form a study group',
      'Meet with teachers during office hours',
      'Review notes within 24 hours of each class',
    ],
    barriers: ['Procrastination', 'Social media distractions', 'Too many extracurriculars'],
    sacrifices: ['Less screen time', 'Fewer late nights with friends', 'Weekend gaming sessions'],
    excitingStatement: 'When I see that improved GPA, I will feel unstoppable and ready to tackle any challenge that comes my way!',
  },
  {
    id: 'learn-new-skill',
    category: 'academics',
    title: 'Learn to Code',
    smartGoal: 'I will complete an online coding course and build 3 projects within 3 months by practicing coding for 1 hour daily.',
    icon: '💻',
    whyReasons: [
      'Future career opportunities',
      'Create my own apps and websites',
      'Problem-solving skills',
      'It looks great on college applications',
      'Join the tech community',
    ],
    actionSteps: [
      'Choose a beginner-friendly language (Python or JavaScript)',
      'Sign up for a free coding course',
      'Code for 1 hour every day',
      'Build small projects to practice',
    ],
    barriers: ['Getting stuck on difficult concepts', 'Losing motivation', 'Not knowing where to start'],
    sacrifices: ['Some TV time', 'Mindless scrolling', 'Part of my gaming time'],
    excitingStatement: 'When I build my first working app, I will feel like a tech wizard who can create anything I imagine!',
  },
  
  // Financial
  {
    id: 'save-money',
    category: 'financial',
    title: 'Build My Savings',
    smartGoal: 'I will save $500 within 4 months by setting aside $30 each week from my allowance/job and avoiding impulse purchases.',
    icon: '💵',
    whyReasons: [
      'Financial independence',
      'Emergency fund for unexpected needs',
      'Save for something big I want',
      'Learn money management skills',
      'Peace of mind knowing I have savings',
    ],
    actionSteps: [
      'Open a savings account',
      'Set up automatic transfers',
      'Track all my spending for a month',
      'Find one expense to cut each week',
    ],
    barriers: ['Temptation to spend', 'Peer pressure to buy things', 'Unexpected expenses'],
    sacrifices: ['Eating out less', 'Fewer impulse purchases', 'Waiting for sales instead of buying now'],
    excitingStatement: 'When I hit my savings goal, I will feel proud and empowered knowing I can achieve financial goals!',
  },
  {
    id: 'start-side-hustle',
    category: 'financial',
    title: 'Start a Side Hustle',
    smartGoal: 'I will earn $200/month from a side hustle within 2 months by identifying a skill I can offer and finding 5 clients.',
    icon: '🚀',
    whyReasons: [
      'Extra spending money',
      'Learn entrepreneurship skills',
      'Build work experience',
      'Save for future goals',
      'Gain independence',
    ],
    actionSteps: [
      'Identify a skill I can monetize (tutoring, pet sitting, social media, etc.)',
      'Create a simple flyer or social media post',
      'Tell friends and family about my service',
      'Deliver great service to get referrals',
    ],
    barriers: ['Finding first clients', 'Balancing with school', 'Pricing my services'],
    sacrifices: ['Free time on weekends', 'Some leisure activities', 'Comfort zone'],
    excitingStatement: 'When I earn my first dollars from my own hustle, I will feel like a true entrepreneur ready to conquer the world!',
  },
  
  // Health & Fitness
  {
    id: 'get-fit',
    category: 'health_fitness',
    title: 'Get in Shape',
    smartGoal: 'I will exercise 4 times per week for 30 minutes and lose 10 pounds in 3 months by following a consistent workout routine.',
    icon: '🏋️',
    whyReasons: [
      'Feel more confident in my body',
      'Have more energy throughout the day',
      'Improve my mental health',
      'Get better at sports',
      'Build lifelong healthy habits',
    ],
    actionSteps: [
      'Choose a workout I actually enjoy',
      'Schedule workouts like appointments',
      'Find a workout buddy for accountability',
      'Track my progress weekly',
    ],
    barriers: ['Lack of motivation', 'Busy schedule', 'Getting bored with routines'],
    sacrifices: ['Sleeping in on workout days', 'Junk food', 'Some Netflix time'],
    excitingStatement: 'When I achieve my fitness goal, I will feel strong, energetic, and proud of what my body can do!',
  },
  {
    id: 'better-sleep',
    category: 'health_fitness',
    title: 'Fix My Sleep Schedule',
    smartGoal: 'I will get 8 hours of sleep every night by going to bed by 10:30 PM and waking up at 6:30 AM for the next 30 days.',
    icon: '😴',
    whyReasons: [
      'Better focus in class',
      'Improved mood and energy',
      'Better athletic performance',
      'Clearer skin',
      'Stronger immune system',
    ],
    actionSteps: [
      'Set a consistent bedtime alarm',
      'Put phone away 1 hour before bed',
      'Create a relaxing bedtime routine',
      'Make my room darker and cooler',
    ],
    barriers: ['Late-night scrolling', 'Homework piling up', 'FOMO on late-night chats'],
    sacrifices: ['Late-night social media', 'Binge-watching shows', 'Late gaming sessions'],
    excitingStatement: 'When I wake up feeling refreshed every morning, I will feel like I have superpowers to tackle any day!',
  },
  
  // Fun & Recreation
  {
    id: 'learn-instrument',
    category: 'fun_recreation',
    title: 'Learn an Instrument',
    smartGoal: 'I will learn to play 5 songs on guitar within 3 months by practicing 30 minutes daily.',
    icon: '🎸',
    whyReasons: [
      'Express myself through music',
      'Impress friends and family',
      'Join a band or music group',
      'Have a creative outlet',
      'Build discipline and patience',
    ],
    actionSteps: [
      'Get access to an instrument',
      'Find online tutorials or a teacher',
      'Practice basic chords first',
      'Learn one song at a time',
    ],
    barriers: ['Sore fingers at first', 'Frustration with slow progress', 'Finding practice time'],
    sacrifices: ['Some gaming time', 'Comfort of being a beginner', 'Instant gratification'],
    excitingStatement: 'When I play my first complete song, I will feel like a rockstar ready to perform for the world!',
  },
  {
    id: 'read-more',
    category: 'fun_recreation',
    title: 'Read More Books',
    smartGoal: 'I will read 12 books this year by reading at least 20 pages every day before bed.',
    icon: '📚',
    whyReasons: [
      'Expand my knowledge and vocabulary',
      'Reduce screen time',
      'Improve focus and concentration',
      'Discover new perspectives',
      'Relaxation and stress relief',
    ],
    actionSteps: [
      'Make a reading list of books I want to read',
      'Keep a book by my bed at all times',
      'Set a daily reading reminder',
      'Join a book club or find a reading buddy',
    ],
    barriers: ['Phone distractions', 'Picking boring books', 'Falling asleep while reading'],
    sacrifices: ['Some screen time', 'Late-night scrolling', 'Skipping to easier entertainment'],
    excitingStatement: 'When I finish my 12th book, I will feel accomplished and wise with new perspectives on life!',
  },
  
  // Career
  {
    id: 'build-resume',
    category: 'career',
    title: 'Build My Resume',
    smartGoal: 'I will complete 3 meaningful activities (internship, volunteer work, or project) within 6 months to strengthen my resume.',
    icon: '📋',
    whyReasons: [
      'Stand out in college applications',
      'Gain real-world experience',
      'Explore career interests',
      'Build professional connections',
      'Develop marketable skills',
    ],
    actionSteps: [
      'Research internship opportunities in my area',
      'Apply to at least 5 positions this month',
      'Start a volunteer project I care about',
      'Document all my experiences and achievements',
    ],
    barriers: ['Rejection', 'Lack of experience', 'Not knowing where to start'],
    sacrifices: ['Free time', 'Comfort zone', 'Some social activities'],
    excitingStatement: 'When I have an impressive resume, I will feel confident and prepared for any opportunity that comes my way!',
  },
  {
    id: 'network-building',
    category: 'career',
    title: 'Build My Network',
    smartGoal: 'I will connect with 10 professionals in my field of interest within 2 months by attending events and reaching out on LinkedIn.',
    icon: '🤝',
    whyReasons: [
      'Learn from experienced people',
      'Find mentors',
      'Discover hidden opportunities',
      'Build confidence in professional settings',
      'Get career advice and guidance',
    ],
    actionSteps: [
      'Create or update my LinkedIn profile',
      'Identify 5 professionals I admire',
      'Send personalized connection requests',
      'Attend one networking event or webinar',
    ],
    barriers: ['Fear of rejection', 'Not knowing what to say', 'Imposter syndrome'],
    sacrifices: ['Comfort of staying anonymous', 'Fear of putting myself out there', 'Time for research'],
    excitingStatement: 'When I build meaningful professional connections, I will feel supported and inspired by amazing people who believe in me!',
  },
];

export const getTemplatesByCategory = (category: GoalCategory): GoalTemplate[] => {
  return GOAL_TEMPLATES.filter(template => template.category === category);
};
