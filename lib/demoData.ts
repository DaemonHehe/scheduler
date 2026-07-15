import type { Course } from '@/types'

export const DEMO_COURSES: Course[] = [
  {
    course_code: 'CS 101',
    name: 'Introduction to Computer Science',
    credits: 4,
    color: 'oklch(0.73 0.23 260)', // Indigo
    sections: [
      {
        section_id: 'CS101-A',
        instructor: 'Dr. Turing',
        schedule: [
          { day: 1, start_time: 540, end_time: 630 }, // Mon 9:00 - 10:30 AM
          { day: 3, start_time: 540, end_time: 630 }, // Wed 9:00 - 10:30 AM
        ],
      },
      {
        section_id: 'CS101-B',
        instructor: 'Dr. Hopper',
        schedule: [
          { day: 2, start_time: 780, end_time: 870 }, // Tue 1:00 - 2:30 PM
          { day: 4, start_time: 780, end_time: 870 }, // Thu 1:00 - 2:30 PM
        ],
      },
      {
        section_id: 'CS101-Evening',
        instructor: 'Dr. Lovelace',
        schedule: [
          { day: 1, start_time: 960, end_time: 1080 }, // Mon 4:00 - 6:00 PM
          { day: 3, start_time: 960, end_time: 1080 }, // Wed 4:00 - 6:00 PM
        ],
      },
    ],
  },
  {
    course_code: 'MATH 201',
    name: 'Calculus I',
    credits: 3,
    color: 'oklch(0.65 0.25 180)', // Teal
    sections: [
      {
        section_id: 'MATH201-1',
        instructor: 'Prof. Newton',
        schedule: [
          { day: 1, start_time: 660, end_time: 720 }, // Mon 11:00 - 12:00 PM
          { day: 3, start_time: 660, end_time: 720 }, // Wed 11:00 - 12:00 PM
          { day: 5, start_time: 660, end_time: 720 }, // Fri 11:00 - 12:00 PM
        ],
      },
      {
        section_id: 'MATH201-2',
        instructor: 'Prof. Leibniz',
        schedule: [
          { day: 2, start_time: 540, end_time: 630 }, // Tue 9:00 - 10:30 AM
          { day: 4, start_time: 540, end_time: 630 }, // Thu 9:00 - 10:30 AM
        ],
      },
    ],
  },
  {
    course_code: 'PHYS 101',
    name: 'Physics for Engineers',
    credits: 4,
    color: 'oklch(0.75 0.18 60)', // Orange
    sections: [
      {
        section_id: 'PHYS101-A',
        instructor: 'Dr. Einstein',
        schedule: [
          { day: 2, start_time: 660, end_time: 750 }, // Tue 11:00 - 12:30 PM
          { day: 4, start_time: 660, end_time: 750 }, // Thu 11:00 - 12:30 PM
        ],
      },
      {
        section_id: 'PHYS101-B',
        instructor: 'Dr. Bohr',
        schedule: [
          { day: 1, start_time: 780, end_time: 870 }, // Mon 1:00 - 2:30 PM
          { day: 3, start_time: 780, end_time: 870 }, // Wed 1:00 - 2:30 PM
        ],
      },
      {
        section_id: 'PHYS101-Night',
        instructor: 'Dr. Curie',
        schedule: [
          { day: 2, start_time: 990, end_time: 1080 }, // Tue 4:30 - 6:00 PM
          { day: 4, start_time: 990, end_time: 1080 }, // Thu 4:30 - 6:00 PM
        ],
      },
    ],
  },
  {
    course_code: 'ENG 101',
    name: 'College Writing',
    credits: 3,
    color: 'oklch(0.71 0.23 20)', // Rose
    sections: [
      {
        section_id: 'ENG101-MWF',
        instructor: 'Prof. Shakespeare',
        schedule: [
          { day: 1, start_time: 540, end_time: 600 }, // Mon 9:00 - 10:00 AM
          { day: 3, start_time: 540, end_time: 600 }, // Wed 9:00 - 10:00 AM
          { day: 5, start_time: 540, end_time: 600 }, // Fri 9:00 - 10:00 AM
        ],
      },
      {
        section_id: 'ENG101-TR',
        instructor: 'Prof. Austen',
        schedule: [
          { day: 2, start_time: 900, end_time: 990 }, // Tue 3:00 - 4:30 PM
          { day: 4, start_time: 900, end_time: 990 }, // Thu 3:00 - 4:30 PM
        ],
      },
    ],
  },
]
