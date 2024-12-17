import { CareerBase } from './career-base';
import { CareerEducation } from './career-education';
import { CareerSkills } from './career-skills';
import { CareerJob } from './career-job';
import { CareerPersonal } from './career-personal';

export interface Career extends 
  CareerBase,
  CareerEducation,
  CareerSkills,
  CareerJob,
  CareerPersonal {}