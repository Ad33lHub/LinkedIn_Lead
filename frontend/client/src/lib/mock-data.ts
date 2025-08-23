import { type InsertLead } from "../../../shared/schema";

export const generateMockLeads = (
  jobTitle?: string, 
  location?: string, 
  industry?: string,
  count: number = 20
): InsertLead[] => {
  const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Rachel', 'Robert', 'Jennifer', 'William', 'Jessica', 'Christopher', 'Ashley', 'Matthew', 'Amanda', 'Anthony', 'Stephanie', 'Mark', 'Nicole'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  
  const jobTitles = {
    technology: ['Software Engineer', 'Product Manager', 'Data Scientist', 'DevOps Engineer', 'UX Designer'],
    finance: ['Financial Analyst', 'Investment Banker', 'Portfolio Manager', 'Risk Analyst', 'Credit Officer'],
    healthcare: ['Physician', 'Nurse Practitioner', 'Healthcare Administrator', 'Medical Research Scientist', 'Pharmacist'],
    marketing: ['Marketing Manager', 'Digital Marketing Specialist', 'Content Strategist', 'Brand Manager', 'Growth Manager'],
    sales: ['Sales Manager', 'Account Executive', 'Business Development Manager', 'Sales Director', 'Channel Manager'],
    consulting: ['Management Consultant', 'Strategy Consultant', 'Business Analyst', 'Process Improvement Specialist', 'Change Manager'],
    education: ['Professor', 'Academic Administrator', 'Educational Consultant', 'Curriculum Developer', 'Research Director'],
    manufacturing: ['Operations Manager', 'Quality Engineer', 'Supply Chain Manager', 'Production Supervisor', 'Plant Manager']
  };
  
  const companies = {
    technology: ['TechCorp', 'DataSys Solutions', 'InnovateX', 'CloudTech', 'DigitalForce', 'NextGen Software', 'FutureTech', 'CyberSolutions'],
    finance: ['FinanceFirst', 'Capital Advisors', 'Investment Partners', 'Wealth Management Co', 'Global Finance Group', 'Strategic Capital'],
    healthcare: ['MedTech Solutions', 'Healthcare Partners', 'Medical Innovations', 'Health Systems Inc', 'Care Connect', 'Wellness Corp'],
    marketing: ['Creative Agency', 'Brand Builders', 'Digital Marketing Pro', 'Growth Solutions', 'Marketing Masters', 'Campaign Central'],
    sales: ['Sales Excellence', 'Revenue Growth Co', 'Business Solutions', 'Client Success Partners', 'Sales Acceleration', 'Deal Makers'],
    consulting: ['Strategy Consultants', 'Business Advisors', 'Management Solutions', 'Process Experts', 'Transformation Partners'],
    education: ['Education Excellence', 'Learning Solutions', 'Academic Partners', 'Knowledge Systems', 'Education Innovations'],
    manufacturing: ['Manufacturing Corp', 'Industrial Solutions', 'Production Systems', 'Quality Manufacturing', 'Operations Excellence']
  };
  
  const locations = [
    'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ',
    'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA',
    'Austin, TX', 'Jacksonville, FL', 'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC',
    'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA', 'Denver, CO', 'Boston, MA'
  ];

  const leads: InsertLead[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const industryKey = industry as keyof typeof jobTitles || 'technology';
    const selectedJobTitles = jobTitles[industryKey] || jobTitles.technology;
    const selectedCompanies = companies[industryKey] || companies.technology;
    
    const name = `${firstName} ${lastName}`;
    const finalJobTitle = jobTitle || selectedJobTitles[Math.floor(Math.random() * selectedJobTitles.length)];
    const company = selectedCompanies[Math.floor(Math.random() * selectedCompanies.length)];
    const finalLocation = location || locations[Math.floor(Math.random() * locations.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`;
    const phone = `+1 (555) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const linkedinUrl = `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase()}`;
    
    leads.push({
      name,
      jobTitle: finalJobTitle,
      company,
      location: finalLocation,
      email,
      phone,
      linkedinUrl,
      apolloData: {
        score: Math.floor(Math.random() * 40 + 60),
        department: industryKey || 'General',
        seniority: Math.random() > 0.7 ? 'Senior' : Math.random() > 0.4 ? 'Manager' : 'Individual Contributor'
      }
    });
  }
  
  return leads;
};
