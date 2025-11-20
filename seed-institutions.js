const prisma = require('./config/prisma');

const institutionsData = {
  "EGS Pillay Group of Institutions": {
    code: "EGSP",
    departments: ["General"]
  },
  "E.G.S.Pillay Arts and Science College": {
    code: "EGSPASC",
    departments: [
      "B.A – Tamil", "B.A – English", "B.A – Defence & Strategic Studies",
      "B.Com", "B.Com – Computer Application", "B.Com – Business Process Service",
      "B.B.A", "B.C.A", "B.Sc – Computer Science", "B.Sc- Computer Science Cognitive Systems",
      "B.Sc- Information Technology", "B.Sc – Visual Communication", "B.Sc – Fashion Tech. & Costume Designing",
      "B.Sc – Physics", "B.Sc – Maths", "B.Sc- Chemistry", "B.Sc – Bio Chemistry",
      "B.Sc – Bio Technology", "B.Sc – Nutrition & Dietetics", "B.Sc – Hospital Administration",
      "B.Sc- Artificial Intelligence and Machine Learning", "B.Sc – Data Science", "B.Sc – Microbiology",
      "B.Com – Professional Accounting",
      "M.Com", "M.B.A", "M.A – English", "M.Sc – Computer Science", "M.Sc – Information Technology",
      "M.Sc – Physics", "M.Sc – Maths", "M.Sc – Chemistry", "M.Sc – Bio Chemistry",
      "M.Sc – Bio Technology", "M.Sc – Food Science & Nutrition"
    ]
  },
  "E.G.S.Pillay Polytechnic College": {
    code: "EGSPPC",
    departments: [
      "Diploma in Mechanical Engineering", "Diploma in Civil Engineering",
      "Diploma in Electrical and Electronics Engineering",
      "Diploma in Electronics and Communication Engineering", "Diploma in Computer Engineering"
    ]
  },
  "E.G.S. Pillay College and School of Nursing": {
    code: "EGSPCSN",
    departments: ["B.Sc – Nursing", "DGNM – (Diploma in General Nursing & Midwifery)"]
  },
  "E.G.S.Pillay College of Education": {
    code: "EGSPCE",
    departments: ["All Subjects", "Training and Placement"]
  },
  "E.G.S. Pillay College of Pharmacy": {
    code: "EGSPCP",
    departments: ["D.Pharm", "B.Pharm", "M.Pharm", "Pharm.D"]
  },
  "EGS Pillay Engineering College": {
    code: "EGSPEC",
    departments: [
      "B.E – Mechanical Engineering", "B.E – Electronics and Communication Engineering",
      "B.E – Electrical & Electronics Engineering", "B.E – Computer Science & Engineering",
      "B.Tech – Information Technology", "B.E – Civil Engineering", "B.E – Bio-Medical Engineering",
      "B.Tech – Computer Science & Business Systems", "B.Tech – Artificial Intelligence and Data Science",
      "M.E (Computer Science and Engineering)", "M.E (Communication Systems)",
      "M.E (Manufacturing Engineering)", "M.E (Power Electronics and Drives)",
      "M.E (Environmental Engineering)", "MCA – Master of Computer Applications",
      "MBA – Master of Business Administration"
    ]
  }
};

// Helper to generate a short code for departments
const generateDeptCode = (name) => {
  return name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase();
};

async function main() {
  console.log('🌱 Seeding Institutions and Departments...');

  for (const [instName, data] of Object.entries(institutionsData)) {
    console.log(`Processing ${instName}...`);
    
    // Upsert Institution
    const institution = await prisma.institution.upsert({
      where: { code: data.code },
      update: { name: instName },
      create: {
        name: instName,
        code: data.code
      }
    });

    // Upsert Departments
    for (const deptName of data.departments) {
      const deptCode = generateDeptCode(deptName);
      
      await prisma.department.upsert({
        where: {
          institutionId_code: {
            institutionId: institution.id,
            code: deptCode
          }
        },
        update: { name: deptName },
        create: {
          name: deptName,
          code: deptCode,
          institutionId: institution.id
        }
      });
    }
  }

  console.log('✅ Seeding Completed!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
