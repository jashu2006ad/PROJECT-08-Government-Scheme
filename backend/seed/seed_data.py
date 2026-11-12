import sys
import os
import datetime

# Add parent directory to path so app modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.config.database import Database
from app.utils.security import hash_password
from bson import ObjectId

def run_seed(db=None):
    if db is None:
        print("🌱 Connecting to database for seeding GovScheme data...")
        db = Database.initialize()

    now = datetime.datetime.now(datetime.timezone.utc)

    # 1. Clear existing collections for a clean idempotent seed
    print("🧹 Cleaning existing demo collections...")
    db.users.delete_many({})
    db.schemes.delete_many({})
    db.categories.delete_many({})
    db.saved_schemes.delete_many({})
    db.applications.delete_many({})
    db.eligibility_results.delete_many({})
    db.document_checklists.delete_many({})
    db.activity_logs.delete_many({})

    # 2. Seed Users (Admin & Citizen)
    print("👤 Seeding system users...")
    admin_user = {
        "_id": ObjectId("660000000000000000000001"),
        "fullName": "National Portal Administrator",
        "email": "admin@govscheme.nic.in",
        "mobile": "9876543210",
        "passwordHash": hash_password("Admin@12345"),
        "role": "admin",
        "state": "National",
        "district": "New Delhi",
        "isActive": True,
        "createdAt": now,
        "updatedAt": now
    }

    citizen_user = {
        "_id": ObjectId("660000000000000000000002"),
        "fullName": "Ravi Kumar Sharma",
        "email": "citizen@govscheme.in",
        "mobile": "9123456780",
        "passwordHash": hash_password("Citizen@12345"),
        "role": "user",
        "state": "Andhra Pradesh",
        "district": "Visakhapatnam",
        "isActive": True,
        "createdAt": now,
        "updatedAt": now
    }

    db.users.insert_many([admin_user, citizen_user])
    print("✅ Users seeded: admin@govscheme.nic.in and citizen@govscheme.in")

    # 3. Seed Categories
    print("📁 Seeding government welfare categories...")
    categories_data = [
        {"_id": ObjectId("661000000000000000000001"), "categoryName": "Agriculture", "description": "Schemes empowering farmers, crop insurance, and agricultural credit.", "icon": "Sprout", "isActive": True, "createdAt": now},
        {"_id": ObjectId("661000000000000000000002"), "categoryName": "Healthcare", "description": "Affordable healthcare, health insurance, and maternal-child health.", "icon": "HeartPulse", "isActive": True, "createdAt": now},
        {"_id": ObjectId("661000000000000000000003"), "categoryName": "Housing", "description": "Affordable housing subsidies and shelter schemes for urban and rural families.", "icon": "Home", "isActive": True, "createdAt": now},
        {"_id": ObjectId("661000000000000000000004"), "categoryName": "Education", "description": "Scholarships, fellowships, and educational assistance for students.", "icon": "GraduationCap", "isActive": True, "createdAt": now},
        {"_id": ObjectId("661000000000000000000005"), "categoryName": "Pension & Social Security", "description": "Guaranteed pensions and social safety nets for elderly and unorganized workers.", "icon": "ShieldCheck", "isActive": True, "createdAt": now},
        {"_id": ObjectId("661000000000000000000006"), "categoryName": "Skill Development", "description": "Vocational training, traditional crafts, and youth skill building.", "icon": "Briefcase", "isActive": True, "createdAt": now},
        {"_id": ObjectId("661000000000000000000007"), "categoryName": "Women & Child Welfare", "description": "Special welfare programs, girl child savings, and women empowerment.", "icon": "Users", "isActive": True, "createdAt": now},
        {"_id": ObjectId("661000000000000000000008"), "categoryName": "Financial Assistance", "description": "Micro-credit, business loans, and financial inclusion programs.", "icon": "Coins", "isActive": True, "createdAt": now}
    ]
    db.categories.insert_many(categories_data)
    print(f"✅ {len(categories_data)} categories seeded.")

    # 4. Seed Verified Indian Government Schemes
    print("📜 Seeding verified Indian government schemes...")
    schemes_data = [
        {
            "_id": ObjectId("662000000000000000000001"),
            "schemeName": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            "slug": "pm-kisan-samman-nidhi",
            "description": "PM-KISAN provides income support of ₹6,000 per year in three equal installments to all landholding farmer families across India to meet agricultural and domestic needs.",
            "objectives": [
                "Augment income of small and marginal farmers.",
                "Ensure financial support for agricultural inputs and domestic obligations.",
                "Protect farmers from falling into the trap of informal moneylenders."
            ],
            "categoryId": ObjectId("661000000000000000000001"),
            "benefits": "₹6,000 per year transferred directly via Direct Benefit Transfer (DBT) in 3 equal four-monthly installments of ₹2,000 each.",
            "targetBeneficiaries": "Small and Marginal Landholding Farmers",
            "eligibility": {
                "summary": "Must be a landholding farmer with cultivable land in their name. High-income institutional landholders, MPs/MLAs, and income-tax payers are excluded.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "occupation", "operator": "==", "value": "Farmer", "description": "Primary occupation must be Farmer"},
                        {"field": "age", "operator": ">=", "value": 18, "description": "Applicant must be at least 18 years old"},
                        {"field": "annualIncome", "operator": "<=", "value": 300000, "description": "Family annual income must be within agricultural assistance limits (<= ₹3,00,000)"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Aadhaar Card", "description": "Mandatory identity proof linked with mobile number", "mandatory": True},
                {"name": "Land Ownership Record (Khatauni/ROR)", "description": "Official land record confirming cultivable land in applicant's name", "mandatory": True},
                {"name": "Bank Account Passbook", "description": "Bank account linked with Aadhaar and NPCI mapped for DBT", "mandatory": True},
                {"name": "Active Mobile Number", "description": "Mobile number registered with Aadhaar for OTP verification", "mandatory": True}
            ],
            "applicationProcedure": [
                "Visit the official PM-KISAN portal (pmkisan.gov.in).",
                "Navigate to 'Farmers Corner' on the homepage and select 'New Farmer Registration'.",
                "Enter your Aadhaar number, select your State, and submit the captcha code.",
                "Provide land record details (District, Sub-District, Block, Village, Khata/Khasra number, land area).",
                "Upload land papers, verify bank details, and submit for District Agriculture Officer verification."
            ],
            "applicationUrl": "https://pmkisan.gov.in/RegistrationFormNew.aspx",
            "officialSourceUrl": "https://pmkisan.gov.in/AboutUs.aspx",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000002"),
            "schemeName": "Ayushman Bharat PM-JAY (Pradhan Mantri Jan Arogya Yojana)",
            "slug": "ayushman-bharat-pm-jay",
            "description": "Ayushman Bharat PM-JAY is the world's largest government-funded healthcare assurance scheme, offering completely cashless hospital treatment up to ₹5 Lakhs per family per year.",
            "objectives": [
                "Eliminate catastrophic out-of-pocket health expenditures.",
                "Provide cashless secondary and tertiary hospitalization across 28,000+ empaneled hospitals.",
                "Cover pre-existing diseases from day one of card activation."
            ],
            "categoryId": ObjectId("661000000000000000000002"),
            "benefits": "Cashless health insurance coverage of ₹5,00,000 per family per year covering 1,949 medical and surgical procedures including medicines, diagnostics, and ICU charges.",
            "targetBeneficiaries": "Economically Weaker Sections, Rural and Urban BPL Families, Senior Citizens 70+",
            "eligibility": {
                "summary": "Families listed in SECC 2011 deprivation criteria, active NFSA ration card holders, or all senior citizens aged 70 and above irrespective of income.",
                "rule": {
                    "operator": "OR",
                    "conditions": [
                        {"field": "age", "operator": ">=", "value": 70, "description": "Senior citizens aged 70 and above (Universal Coverage under Ayushman Vaya Vandana)"},
                        {
                            "operator": "AND",
                            "conditions": [
                                {"field": "annualIncome", "operator": "<=", "value": 250000, "description": "Annual household income must be ₹2,50,000 or below"},
                                {"field": "socialCategory", "operator": "IN", "value": ["BPL", "EWS", "SC", "ST", "OBC", "General"], "description": "Eligible category status"}
                            ]
                        }
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Aadhaar Card", "description": "Biometric e-KYC authentication", "mandatory": True},
                {"name": "Ration Card / Family ID", "description": "State NFSA Ration Card or SECC Household ID", "mandatory": True},
                {"name": "Active Mobile Number", "description": "For receiving digital Ayushman Card OTP", "mandatory": True}
            ],
            "applicationProcedure": [
                "Open the official beneficiary portal at beneficiary.nha.gov.in.",
                "Login with your mobile number via OTP.",
                "Search your family record using Aadhaar Number, Ration Card, or Family ID.",
                "Complete e-KYC by Aadhaar OTP or biometric authentication.",
                "Download the verified Ayushman Card instantly upon approval."
            ],
            "applicationUrl": "https://beneficiary.nha.gov.in",
            "officialSourceUrl": "https://pmjay.gov.in/about/pmjay",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000003"),
            "schemeName": "Pradhan Mantri Awas Yojana (PMAY - Housing For All)",
            "slug": "pradhan-mantri-awas-yojana",
            "description": "Pradhan Mantri Awas Yojana aims to provide pucca houses with basic amenities (piped water, sanitation, electricity) to all eligible houseless and kutcha house families.",
            "objectives": [
                "Provide durable pucca housing to houseless and vulnerable families.",
                "Deliver credit-linked interest subsidies for urban home purchases and construction.",
                "Promote women empowerment by requiring female head or co-ownership of homes."
            ],
            "categoryId": ObjectId("661000000000000000000003"),
            "benefits": "Direct grant of ₹1,20,000 (Plains) / ₹1,30,000 (Hilly states) in PMAY-Gramin, plus 90-95 days of MGNREGA wages and ₹12,000 for toilet construction.",
            "targetBeneficiaries": "Houseless Citizens, EWS, Low Income Groups (LIG)",
            "eligibility": {
                "summary": "Must not own a pucca house anywhere in India. Family annual income must not exceed ₹3,00,000 for EWS category.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "age", "operator": ">=", "value": 18, "description": "Applicant must be an adult (18+)"},
                        {"field": "annualIncome", "operator": "<=", "value": 300000, "description": "Annual family income must not exceed ₹3,00,000"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Aadhaar Card", "description": "Applicant and all family members", "mandatory": True},
                {"name": "Income Certificate", "description": "Issued by Competent Authority / Tehsildar", "mandatory": True},
                {"name": "Bank Passbook", "description": "Bank account details for subsidy disbursement", "mandatory": True},
                {"name": "Affidavit / No-Pucca House Certificate", "description": "Self-declaration of not owning a pucca home", "mandatory": True}
            ],
            "applicationProcedure": [
                "For Rural (PMAY-G): Eligible families are prioritized via Gram Sabha Awaas+ list through Block Office.",
                "For Urban (PMAY-U): Apply online at pmaymis.gov.in under 'Citizen Assessment' tab.",
                "Enter 12-digit Aadhaar number and verify name.",
                "Fill in complete demographic, family member, and residential details.",
                "Save assessment form and note down your Application Reference Number for tracking."
            ],
            "applicationUrl": "https://pmaymis.gov.in/Open/Check_Aadhar_Existence.aspx",
            "officialSourceUrl": "https://pmayg.nic.in",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000004"),
            "schemeName": "National Scholarship Portal - Post-Matric Scholarship",
            "slug": "nsp-post-matric-scholarship",
            "description": "Comprehensive central and state government scholarships on the National Scholarship Portal (NSP) supporting higher secondary, undergraduate, and postgraduate students.",
            "objectives": [
                "Ensure timely financial disbursement of higher education scholarships directly into student accounts.",
                "Prevent dropouts among students from underprivileged backgrounds.",
                "Provide a single digital window for all central and state student scholarship schemes."
            ],
            "categoryId": ObjectId("661000000000000000000004"),
            "benefits": "Complete reimbursement of compulsory non-refundable college tuition fees plus maintenance allowance up to ₹1,200/month.",
            "targetBeneficiaries": "College and University Students, SC/ST/OBC/Minority/EWS Students",
            "eligibility": {
                "summary": "Enrolled in a recognized college or university course. Age between 15 and 35. Family annual income less than or equal to ₹2,50,000.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "occupation", "operator": "==", "value": "Student", "description": "Applicant must currently be a student"},
                        {"field": "age", "operator": ">=", "value": 15, "description": "Minimum age is 15 years"},
                        {"field": "age", "operator": "<=", "value": 35, "description": "Maximum age is 35 years"},
                        {"field": "annualIncome", "operator": "<=", "value": 250000, "description": "Annual household income must be ≤ ₹2,50,000"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Previous Year Academic Marksheet", "description": "Attested marksheet showing passing grades", "mandatory": True},
                {"name": "College Admission Fee Receipt", "description": "Current semester fee receipt", "mandatory": True},
                {"name": "Bonafide Student Certificate", "description": "Certificate issued by college registrar/head", "mandatory": True},
                {"name": "Income Certificate", "description": "Valid family income certificate", "mandatory": True},
                {"name": "Student Bank Passbook", "description": "Active bank account in student's sole name", "mandatory": True}
            ],
            "applicationProcedure": [
                "Visit the National Scholarship Portal at scholarships.gov.in.",
                "Register for an OTR (One Time Registration) using Aadhaar Number.",
                "Fill the Common Application Form with educational and institutional details.",
                "Upload marksheet, income proof, and bonafide certificate.",
                "Submit application; the college nodal officer will verify and forward to the district officer."
            ],
            "applicationUrl": "https://scholarships.gov.in",
            "officialSourceUrl": "https://scholarships.gov.in/public/faq",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000005"),
            "schemeName": "Atal Pension Yojana (APY)",
            "slug": "atal-pension-yojana",
            "description": "Atal Pension Yojana is a government-backed periodic pension scheme targeted at citizens in the unorganized sector to secure guaranteed post-retirement income.",
            "objectives": [
                "Provide social security and income protection during old age.",
                "Encourage voluntary pension savings among workers in unorganized segments.",
                "Guarantee fixed pension ranging from ₹1,000 to ₹5,000 per month starting at age 60."
            ],
            "categoryId": ObjectId("661000000000000000000005"),
            "benefits": "Guaranteed pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000, or ₹5,000 per month from age 60 until demise, followed by full return of pension corpus to legal nominee.",
            "targetBeneficiaries": "All Indian Citizens aged 18 to 40 years",
            "eligibility": {
                "summary": "Must be an Indian citizen aged between 18 and 40 years with a valid savings bank account. Applicant must not be an income-tax payer.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "age", "operator": ">=", "value": 18, "description": "Minimum joining age is 18 years"},
                        {"field": "age", "operator": "<=", "value": 40, "description": "Maximum joining age is 40 years"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Aadhaar Card", "description": "Identity and address proof", "mandatory": True},
                {"name": "Savings Bank Account", "description": "Account with auto-debit facility enabled", "mandatory": True},
                {"name": "Active Mobile Number", "description": "For contribution SMS alerts and PRAN generation", "mandatory": True}
            ],
            "applicationProcedure": [
                "Visit your bank branch or log in to your bank's Internet Banking/Mobile App.",
                "Navigate to Government Schemes -> Atal Pension Yojana (APY).",
                "Select desired monthly pension tier (₹1,000 to ₹5,000) and contribution frequency (monthly/quarterly).",
                "Authorize auto-debit consent from your savings account.",
                "Receive Permanent Retirement Account Number (PRAN) via SMS."
            ],
            "applicationUrl": "https://enps.nsdl.com/eNPS/ApySubForm.html",
            "officialSourceUrl": "https://www.npscra.nsdl.co.in/scheme-details.php",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000006"),
            "schemeName": "PM Vishwakarma Scheme",
            "slug": "pm-vishwakarma-scheme",
            "description": "Comprehensive scheme providing holistic end-to-end support to traditional artisans and craftspeople working with their hands and tools across 18 traditional trades.",
            "objectives": [
                "Provide formal recognition and certification to traditional artisans.",
                "Deliver modern skill upgradation training with daily stipends.",
                "Provide collateral-free enterprise credit at a concessional interest rate of 5%."
            ],
            "categoryId": ObjectId("661000000000000000000006"),
            "benefits": "Free PM Vishwakarma ID card, ₹500/day training stipend (5-7 days basic, 15 days advanced), ₹15,000 modern toolkit grant, and up to ₹3,00,000 collateral-free credit at 5% interest.",
            "targetBeneficiaries": "Artisans, Carpenters, Blacksmiths, Potters, Sculptors, Cobblers, Tailors, Weavers",
            "eligibility": {
                "summary": "Must be an artisan or craftsperson engaged in one of the 18 specified trades on self-employment basis. Minimum age 18 years.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "age", "operator": ">=", "value": 18, "description": "Minimum age must be 18 years"},
                        {"field": "occupation", "operator": "IN", "value": ["Self-employed", "Other", "Unemployed"], "description": "Artisan, craftsperson, or self-employed trade"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Aadhaar Card", "description": "Biometric verification required", "mandatory": True},
                {"name": "Active Mobile Number", "description": "Linked with Aadhaar", "mandatory": True},
                {"name": "Bank Account Details", "description": "Passbook copy for direct credit transfer", "mandatory": True},
                {"name": "Ration Card", "description": "Family composition proof", "mandatory": False}
            ],
            "applicationProcedure": [
                "Visit any Common Services Centre (CSC) with your Aadhaar and bank passbook.",
                "CSC operator conducts biometric authentication and registers your traditional trade details.",
                "Gram Panchayat / Urban Local Body conducts field verification of the artisan's trade.",
                "Upon approval, receive the official PM Vishwakarma digital certificate and ID.",
                "Enroll for basic training and receive toolkit voucher of ₹15,000."
            ],
            "applicationUrl": "https://pmvishwakarma.gov.in",
            "officialSourceUrl": "https://pmvishwakarma.gov.in/Home/AboutScheme",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000007"),
            "schemeName": "MGNREGA (Rural Employment Guarantee Act)",
            "slug": "mgnrega-rural-employment",
            "description": "MGNREGA provides a legal guarantee for at least 100 days of wage employment in every financial year to every rural household whose adult members volunteer to do unskilled manual work.",
            "objectives": [
                "Enhance livelihood security in rural areas through guaranteed manual employment.",
                "Create durable community assets (water conservation, rural roads, afforestation).",
                "Ensure minimum wage payment directly into worker bank/post office accounts."
            ],
            "categoryId": ObjectId("661000000000000000000006"),
            "benefits": "Statutory guarantee of 100 days of paid wage employment per household per year. Wages paid directly into bank accounts within 15 days.",
            "targetBeneficiaries": "Rural households, adult members volunteering for unskilled manual labor",
            "eligibility": {
                "summary": "Must be a rural resident, adult aged 18 or older, willing to do unskilled manual work.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "age", "operator": ">=", "value": 18, "description": "Applicant must be an adult aged 18 or above"},
                        {"field": "occupation", "operator": "IN", "value": ["Unemployed", "Farmer", "Other"], "description": "Engaged in rural unorganized or agricultural labor"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Aadhaar Card", "description": "Identity verification and DBT linking", "mandatory": True},
                {"name": "Proof of Rural Residence", "description": "Voter ID, Ration Card, or Gram Panchayat verification", "mandatory": True},
                {"name": "Passport Size Photographs", "description": "Two copies for Job Card", "mandatory": True},
                {"name": "Bank/Post Office Passbook", "description": "Single or joint account for direct wage deposit", "mandatory": True}
            ],
            "applicationProcedure": [
                "Submit an oral or written application to the local Gram Panchayat office.",
                "Gram Panchayat verifies residency and issues an MGNREGA Job Card within 15 days.",
                "Submit a written work demand stating the period for which employment is sought.",
                "Gram Panchayat assigns work within 5 km radius within 15 days of demand; otherwise unemployment allowance is payable."
            ],
            "applicationUrl": "https://nrega.nic.in",
            "officialSourceUrl": "https://nrega.nic.in/MGNREGA_new/Nrega_home.aspx",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000008"),
            "schemeName": "Sukanya Samriddhi Yojana (SSY)",
            "slug": "sukanya-samriddhi-yojana",
            "description": "A dedicated government savings scheme for girl children under the Beti Bachao Beti Padhao campaign offering attractive sovereign interest rates and full tax exemptions.",
            "objectives": [
                "Promote savings to fund the higher education and marriage of girl children.",
                "Eliminate gender disparity and support girl child welfare.",
                "Provide Triple-E (Exempt-Exempt-Exempt) tax benefits under Section 80C."
            ],
            "categoryId": ObjectId("661000000000000000000007"),
            "benefits": "Highest sovereign interest rate (currently 8.2% p.a. compounded yearly). Tax free interest and maturity. Minimum deposit ₹250/year up to ₹1.5 Lakh/year.",
            "targetBeneficiaries": "Parents and legal guardians of girl children aged 10 or below",
            "eligibility": {
                "summary": "Account can be opened by natural or legal guardian for a girl child from her birth up to age 10. Maximum 2 accounts per family (or 3 in case of twin girls).",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "gender", "operator": "==", "value": "Female", "description": "Beneficiary must be a female child"},
                        {"field": "age", "operator": "<=", "value": 10, "description": "Child's age must be 10 years or younger"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Girl Child Birth Certificate", "description": "Issued by municipal corporation or registrar of births", "mandatory": True},
                {"name": "Guardian's Aadhaar Card", "description": "Parent or guardian identity proof", "mandatory": True},
                {"name": "Address Proof", "description": "Electricity bill, voter card, or passport of guardian", "mandatory": True},
                {"name": "Initial Deposit Challan", "description": "Minimum ₹250 cash or cheque", "mandatory": True}
            ],
            "applicationProcedure": [
                "Collect the SSY Account Opening Form from any India Post Office or authorized commercial bank.",
                "Fill in the child and guardian details along with nomination.",
                "Attach copies of the child's birth certificate and guardian KYC documents.",
                "Submit with minimum deposit of ₹250.",
                "The post office/bank issues a passbook recording all deposits and accumulated interest."
            ],
            "applicationUrl": "https://www.indiapost.gov.in/Financial/Pages/Content/Sukanya-Samriddhi-Account.aspx",
            "officialSourceUrl": "https://www.indiapost.gov.in",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000009"),
            "schemeName": "Pradhan Mantri Mudra Yojana (PMMY)",
            "slug": "pradhan-mantri-mudra-yojana",
            "description": "PMMY provides collateral-free institutional credit up to ₹10 Lakhs to micro and small enterprises in manufacturing, trading, and service sectors.",
            "objectives": [
                "Fund the unfunded small entrepreneurs and shopkeepers.",
                "Eliminate dependence on high-interest informal lenders.",
                "Promote grassroots entrepreneurship and employment generation."
            ],
            "categoryId": ObjectId("661000000000000000000008"),
            "benefits": "Collateral-free loans in 3 categories: Shishu (loans up to ₹50,000), Kishore (loans ₹50,001 to ₹5 Lakhs), and Tarun (loans ₹5,00,001 to ₹10 Lakhs) at affordable bank interest rates.",
            "targetBeneficiaries": "Small business owners, shopkeepers, fruit/vegetable vendors, micro-manufacturers",
            "eligibility": {
                "summary": "Any Indian citizen who has a business proposal for a non-farm income-generating activity and is not in default with any financial institution.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "age", "operator": ">=", "value": 18, "description": "Applicant must be at least 18 years old"},
                        {"field": "occupation", "operator": "IN", "value": ["Self-employed", "Employed", "Other"], "description": "Engaged in business, trade, or micro-enterprise"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Identity Proof", "description": "Aadhaar Card, Voter ID, or PAN Card", "mandatory": True},
                {"name": "Residence Proof", "description": "Utility bill or property tax receipt", "mandatory": True},
                {"name": "Business Proof / Registration", "description": "Udyam registration or shop license", "mandatory": False},
                {"name": "Bank Account Statements", "description": "Last 6 months account statement", "mandatory": True},
                {"name": "Quotation of Machinery / Items", "description": "Estimates for items to be purchased", "mandatory": True}
            ],
            "applicationProcedure": [
                "Prepare your business proposal and cost estimate.",
                "Apply online via UdyamiMitra Portal (udyamimitra.in) or visit any commercial bank or MFI.",
                "Fill the Mudra loan application form matching your category (Shishu, Kishore, or Tarun).",
                "Submit KYC, business registration, and quotation documents.",
                "Upon sanction, loan funds are disbursed directly to your account with a Mudra debit card."
            ],
            "applicationUrl": "https://www.udyamimitra.in",
            "officialSourceUrl": "https://www.mudra.org.in/AboutUs/Genesis",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000010"),
            "schemeName": "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
            "slug": "national-old-age-pension-scheme",
            "description": "Central social assistance welfare scheme providing non-contributory monthly pensions to destitute elderly citizens living below the poverty line.",
            "objectives": [
                "Provide social security and basic sustenance to destitute elderly citizens.",
                "Ensure dignity of life for senior citizens without family support.",
                "Deliver monthly pension directly into beneficiary bank/post office accounts."
            ],
            "categoryId": ObjectId("661000000000000000000005"),
            "benefits": "Monthly pension of ₹200-₹500 central share, combined with state top-up providing total monthly pension up to ₹2,500-₹3,000.",
            "targetBeneficiaries": "BPL senior citizens aged 60 and above",
            "eligibility": {
                "summary": "Applicant must be aged 60 or above and belong to a household living Below Poverty Line (BPL) as per state criteria.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "age", "operator": ">=", "value": 60, "description": "Applicant must be aged 60 or older"},
                        {"field": "annualIncome", "operator": "<=", "value": 100000, "description": "Annual household income must be ≤ ₹1,00,000 (BPL category)"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Age Proof", "description": "Aadhaar Card, Voter ID, or School Leaving Certificate", "mandatory": True},
                {"name": "BPL Ration Card", "description": "Valid Below Poverty Line card", "mandatory": True},
                {"name": "Income Certificate", "description": "Certified by Tehsildar or Revenue Officer", "mandatory": True},
                {"name": "Bank Passbook", "description": "Single account details for pension credit", "mandatory": True}
            ],
            "applicationProcedure": [
                "Obtain the IGNOAPS application form from the Block Development Office or Municipal Corporation.",
                "Attach proof of age, BPL status, and bank account passbook copy.",
                "Submit the application to the Social Welfare Officer / Gram Panchayat Secretary.",
                "Following field verification, the District Collector approves the pension order."
            ],
            "applicationUrl": "https://nsap.nic.in",
            "officialSourceUrl": "https://nsap.nic.in/aboutus.do",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000011"),
            "schemeName": "Pradhan Mantri Ujjwala Yojana (PMUY 2.0)",
            "slug": "pradhan-mantri-ujjwala-yojana",
            "description": "PMUY provides deposit-free LPG connections along with free first refill and stove to adult women from poor and vulnerable households across India.",
            "objectives": [
                "Empower women and safeguard their respiratory health from hazardous biomass smoke.",
                "Provide smoke-free rural kitchens with subsidized LPG cooking gas.",
                "Prevent deforestation and indoor air pollution in rural and peri-urban areas."
            ],
            "categoryId": ObjectId("661000000000000000000007"),
            "benefits": "Deposit-free LPG connection including security deposit waiver for cylinder & pressure regulator, free LPG hose pipe, domestic gas consumer card book, and completely free first refill + stove.",
            "targetBeneficiaries": "Adult women from BPL / Poor rural households without an existing LPG connection",
            "eligibility": {
                "summary": "Applicant must be an adult woman aged 18 or above belonging to a poor household (BPL/EWS/SECC) with no existing LPG connection in the family.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "gender", "operator": "==", "value": "Female", "description": "Applicant must be an adult woman"},
                        {"field": "age", "operator": ">=", "value": 18, "description": "Applicant must be at least 18 years old"},
                        {"field": "annualIncome", "operator": "<=", "value": 200000, "description": "Annual household income must not exceed ₹2,00,000"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Aadhaar Card of Woman Applicant", "description": "Proof of identity and address", "mandatory": True},
                {"name": "Ration Card", "description": "Document establishing family composition", "mandatory": True},
                {"name": "Bank Account Passbook", "description": "Bank account linked with Aadhaar for DBT subsidy", "mandatory": True},
                {"name": "Self-Declaration of No Existing LPG", "description": "Confirmation that no LPG connection exists in household", "mandatory": True}
            ],
            "applicationProcedure": [
                "Apply online via official portal (pmuy.gov.in) or submit form at nearest LPG distributor (Indane, BharatGas, HP Gas).",
                "Enter 14-point declaration and family details matching ration card.",
                "Provide e-KYC using Aadhaar OTP or biometric authentication at the gas agency.",
                "LPG distributor verifies family duplication check across oil marketing companies.",
                "Receive installation of gas cylinder, regulator, and stove at doorstep."
            ],
            "applicationUrl": "https://www.pmuy.gov.in/ujjwala2.html",
            "officialSourceUrl": "https://www.pmuy.gov.in",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000012"),
            "schemeName": "PM Surya Ghar: Muft Bijli Yojana (Rooftop Solar)",
            "slug": "pm-surya-ghar-muft-bijli-yojana",
            "description": "Flagship national solar scheme providing substantial financial subsidies up to ₹78,000 to households for installing rooftop solar systems, offering up to 300 units of free clean electricity every month.",
            "objectives": [
                "Provide up to 300 units of free solar electricity every month to 1 crore residential households.",
                "Reduce household electricity expenditures and enable earning through surplus power feed-in.",
                "Add 30 GW of clean solar capacity in the residential sector."
            ],
            "categoryId": ObjectId("661000000000000000000003"),
            "benefits": "Direct central capital subsidy of ₹30,000 for 1 kW system, ₹60,000 for 2 kW system, and up to ₹78,000 for 3 kW and above rooftop systems transferred directly into citizen bank account.",
            "targetBeneficiaries": "Residential homeowners having a grid-connected electricity connection and suitable roof space",
            "eligibility": {
                "summary": "Must be an Indian citizen homeowner with an active domestic electricity connection in their name and suitable roof space with no prior solar subsidy availed.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "age", "operator": ">=", "value": 18, "description": "Applicant must be an adult homeowner (18+)"},
                        {"field": "annualIncome", "operator": "<=", "value": 1500000, "description": "Household income within residential solar assistance limits"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Latest Electricity Bill", "description": "Consumer account number from local power DISCOM", "mandatory": True},
                {"name": "Aadhaar Card", "description": "Proof of identity and address", "mandatory": True},
                {"name": "Bank Account Passbook / Cancelled Cheque", "description": "Account details for direct subsidy credit", "mandatory": True},
                {"name": "Roof Ownership Proof / House Tax Receipt", "description": "Document confirming roof ownership/rights", "mandatory": True}
            ],
            "applicationProcedure": [
                "Register on the national portal at pmsuryaghar.gov.in with your State, Electricity Distribution Company (DISCOM), and Consumer Number.",
                "Apply for rooftop solar net-metering approval online.",
                "Choose a registered vendor empaneled with your DISCOM to install the solar panels.",
                "DISCOM officials inspect installation and install a bi-directional net meter.",
                "Commissioning certificate is generated online; submit bank details on portal to receive subsidy within 30 days."
            ],
            "applicationUrl": "https://pmsuryaghar.gov.in",
            "officialSourceUrl": "https://pmsuryaghar.gov.in/consumerInformation",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000013"),
            "schemeName": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
            "slug": "pradhan-mantri-matru-vandana-yojana",
            "description": "Centrally sponsored maternity benefit program providing direct cash incentives to pregnant women and lactating mothers for health checkups, safe delivery, and immunization.",
            "objectives": [
                "Provide wage compensation during pregnancy and childbirth to ensure rest and nutrition.",
                "Promote institutional deliveries and timely immunization of infants.",
                "Discourage female foeticide through higher financial grants for second girl child."
            ],
            "categoryId": ObjectId("661000000000000000000007"),
            "benefits": "₹5,000 in two installments for the first live birth, and ₹6,000 in a single installment upon the birth of a second girl child, transferred via DBT into mother's bank account.",
            "targetBeneficiaries": "Pregnant women and lactating mothers (PW&LM) from socio-economically disadvantaged families",
            "eligibility": {
                "summary": "Must be a pregnant woman or lactating mother aged 19 or above with family income under ₹8,00,000, not in regular central/state government employment.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "gender", "operator": "==", "value": "Female", "description": "Beneficiary must be female"},
                        {"field": "age", "operator": ">=", "value": 19, "description": "Mother must be at least 19 years old at time of pregnancy registration"},
                        {"field": "annualIncome", "operator": "<=", "value": 800000, "description": "Family income must be below ₹8,00,000"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Mother and Child Protection (MCP) Card", "description": "Issued by Anganwadi / Primary Health Centre", "mandatory": True},
                {"name": "Aadhaar Card of Mother", "description": "Mandatory identity proof", "mandatory": True},
                {"name": "Mother's Individual Bank Account Passbook", "description": "Single account seeded with Aadhaar", "mandatory": True},
                {"name": "Child Birth Certificate", "description": "Required for claim of second installment or second girl child", "mandatory": True}
            ],
            "applicationProcedure": [
                "Register at the local Anganwadi Centre (AWC) or approved health facility within 570 days of Last Menstrual Period (LMP).",
                "Apply online via the citizen login on the PMMVY soft portal (pmmvy.wcd.gov.in).",
                "Enter details of MCP card, antenatal checkups (ANC), and institutional delivery.",
                "Verification is performed by Child Development Project Officer (CDPO).",
                "Cash incentive is credited directly into mother's verified Aadhaar-linked account."
            ],
            "applicationUrl": "https://pmmvy.wcd.gov.in",
            "officialSourceUrl": "https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000014"),
            "schemeName": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            "slug": "pradhan-mantri-fasal-bima-yojana",
            "description": "Comprehensive agricultural crop insurance scheme offering full financial protection to farmers against non-preventable yield loss and localized calamities at lowest uniform premiums.",
            "objectives": [
                "Provide financial stability to farmers suffering crop loss/damage due to unforeseen weather events.",
                "Encourage adoption of innovative modern agricultural practices.",
                "Ensure flow of institutional credit to the agriculture sector."
            ],
            "categoryId": ObjectId("661000000000000000000001"),
            "benefits": "Full insurance payout against crop loss. Uniformly low premium paid by farmers: only 2% for Kharif food/oilseed crops, 1.5% for Rabi crops, and 5% for commercial/horticultural crops; the rest is fully subsidized by the Government.",
            "targetBeneficiaries": "All farmers including sharecroppers and tenant farmers growing notified crops in notified areas",
            "eligibility": {
                "summary": "All farmers growing notified crops in notified insurance areas having insurable interest in the cultivated land.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "occupation", "operator": "==", "value": "Farmer", "description": "Primary occupation must be Farmer"},
                        {"field": "age", "operator": ">=", "value": 18, "description": "Applicant must be at least 18 years old"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Land Record / Sowing Certificate", "description": "Khasra/Khatauni or Village Patwari sowing certificate", "mandatory": True},
                {"name": "Aadhaar Card", "description": "Proof of identity", "mandatory": True},
                {"name": "Bank Account Passbook", "description": "Bank account copy for direct claim settlement", "mandatory": True},
                {"name": "Tenancy Agreement / Sowing Declaration", "description": "For tenant and sharecropper farmers", "mandatory": False}
            ],
            "applicationProcedure": [
                "Visit the national crop insurance portal at pmfby.gov.in or apply via CSC / Bank branch / National Crop Insurance App.",
                "Register as a farmer using Aadhaar and mobile number.",
                "Select State, Season, Year, Crop, and Sowing Date.",
                "Enter survey/plot number and upload land record or sowing certificate.",
                "Pay nominal premium online or at bank; policy certificate is issued with instant tracking ID."
            ],
            "applicationUrl": "https://pmfby.gov.in",
            "officialSourceUrl": "https://pmfby.gov.in/overview",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000015"),
            "schemeName": "National Apprenticeship Promotion Scheme (NAPS)",
            "slug": "national-apprenticeship-promotion-scheme",
            "description": "Scheme promoting industry apprenticeships by providing monthly stipend subsidies directly to youth to gain industry-recognized hands-on technical skills and job readiness.",
            "objectives": [
                "Bridge the skill gap between academic training and real industry requirements.",
                "Incentivize employers to engage youth apprentices.",
                "Provide guaranteed monthly stipends directly into apprentice bank accounts via DBT."
            ],
            "categoryId": ObjectId("661000000000000000000006"),
            "benefits": "Monthly stipend paid during 6 to 36 months of apprenticeship. Government directly reimburses 25% of prescribed stipend up to ₹1,500/month directly into the apprentice's bank account via DBT.",
            "targetBeneficiaries": "Youth aged 14 to 35 who have completed 5th, 8th, 10th, 12th, ITI, Diploma, or Graduate education",
            "eligibility": {
                "summary": "Must be an Indian citizen aged between 16 and 35 seeking technical apprenticeship training with basic educational qualification.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "age", "operator": ">=", "value": 16, "description": "Minimum age is 16 years"},
                        {"field": "age", "operator": "<=", "value": 35, "description": "Maximum age is 35 years"},
                        {"field": "occupation", "operator": "IN", "value": ["Student", "Unemployed", "Other"], "description": "Youth apprentice seeking industrial vocational training"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Aadhaar Card", "description": "Identity and age proof", "mandatory": True},
                {"name": "Educational Certificate / Marksheet", "description": "10th/12th/ITI/Diploma marksheet", "mandatory": True},
                {"name": "Bank Account Passbook", "description": "Active Aadhaar-seeded account for stipend DBT", "mandatory": True},
                {"name": "Resume / Trade Preference", "description": "Profile details for industry matching", "mandatory": False}
            ],
            "applicationProcedure": [
                "Register as a Candidate on the official Apprenticeship portal at apprenticeshipindia.gov.in.",
                "Complete e-KYC using Aadhaar OTP.",
                "Search apprenticeship opportunities by trade, sector, and district.",
                "Apply to verified establishments and interview for placement.",
                "Sign the Apprenticeship Contract online; monthly stipend is credited directly to your bank account."
            ],
            "applicationUrl": "https://www.apprenticeshipindia.gov.in/candidate-registration",
            "officialSourceUrl": "https://www.apprenticeshipindia.gov.in",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000016"),
            "schemeName": "Unique Disability ID (UDID) & Swavlamban Welfare",
            "slug": "unique-disability-id-swavlamban",
            "description": "National initiative creating a seamless single digital verification ID for Persons with Disabilities (Divyangjan) granting streamlined access to welfare aids, concessions, and reservations across India.",
            "objectives": [
                "Create a centralized national database for Persons with Disabilities (Divyangjan).",
                "Eliminate the need to carry multiple physical medical certificates for government concessions.",
                "Streamline delivery of free assistive devices, transport concessions, and welfare pensions."
            ],
            "categoryId": ObjectId("661000000000000000000002"),
            "benefits": "Nationally recognized UDID smart card providing hassle-free access to railway concessions, bus travel passes, free motorized tricycles/hearing aids/braille kits under ADIP scheme, and government disability pensions.",
            "targetBeneficiaries": "Persons with Disabilities (benchmark disability 40% and above across 21 notified disability types)",
            "eligibility": {
                "summary": "Any Indian citizen having a benchmark disability under the Rights of Persons with Disabilities (RPwD) Act 2016.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "disabilityStatus", "operator": "==", "value": "Yes", "description": "Applicant must have a benchmark disability (PwD)"},
                        {"field": "age", "operator": ">=", "value": 1, "description": "Open to all age groups"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Aadhaar Card", "description": "Proof of identity and address", "mandatory": True},
                {"name": "Passport Size Photograph", "description": "Recent photograph of applicant", "mandatory": True},
                {"name": "Disability Certificate (if previously issued)", "description": "Existing certificate issued by District Medical Board", "mandatory": False},
                {"name": "Hospital Medical Records", "description": "Diagnostic and clinical reports of disability", "mandatory": True}
            ],
            "applicationProcedure": [
                "Visit the Swavlamban Portal at swavlambancard.gov.in.",
                "Click on 'Apply for Disability Certificate & UDID Card'.",
                "Fill demographic, personal, employment, and disability details.",
                "Upload photo, signature/thumb impression, and address proof.",
                "Visit the designated District Hospital for medical board assessment.",
                "Upon medical verification, digital UDID card is generated online and physical smart card is dispatched via speed post."
            ],
            "applicationUrl": "https://www.swavlambancard.gov.in/pwd/application",
            "officialSourceUrl": "https://www.swavlambancard.gov.in",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000017"),
            "schemeName": "PM SVANidhi (Street Vendor's AtmaNirbhar Nidhi)",
            "slug": "pm-svanidhi-street-vendors-loan",
            "description": "Special micro-credit facility empowering urban and semi-urban street vendors with affordable collateral-free working capital loans and cashback rewards on digital transactions.",
            "objectives": [
                "Provide formal financial credit to street vendors without collateral.",
                "Incentivize timely repayment through interest subsidy of 7% per annum.",
                "Promote digital literacy and digital transactions with cashbacks up to ₹1,200/year."
            ],
            "categoryId": ObjectId("661000000000000000000008"),
            "benefits": "Collateral-free working capital loan of ₹10,000 for 1st term, ₹20,000 on timely repayment for 2nd term, and up to ₹50,000 for 3rd term. Subsidized 7% interest rebate credited directly to bank account.",
            "targetBeneficiaries": "Street vendors, hawkers, thelewala, fruit/vegetable sellers in urban and peri-urban locations",
            "eligibility": {
                "summary": "Must be an urban street vendor possessing a Certificate of Vending / ID card issued by Urban Local Body (ULB) or Letter of Recommendation (LoR).",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "age", "operator": ">=", "value": 18, "description": "Applicant must be an adult aged 18 or older"},
                        {"field": "occupation", "operator": "IN", "value": ["Self-employed", "Other", "Unemployed"], "description": "Street vendor, petty tradesperson, or hawker"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Aadhaar Card", "description": "Identity and address proof linked with mobile number", "mandatory": True},
                {"name": "Certificate of Vending / Vending ID Card", "description": "Issued by Municipality or Letter of Recommendation (LoR)", "mandatory": True},
                {"name": "Bank Account Passbook", "description": "Active bank account for loan disbursement", "mandatory": True}
            ],
            "applicationProcedure": [
                "Visit the PM SVANidhi portal at pmsvanidhi.mohua.gov.in or apply at nearest CSC / Bank branch.",
                "Verify mobile number with OTP and check vendor status using your ULB Survey / Vending ID.",
                "Choose your preferred lending institution (Public/Private Bank, Microfinance Institution).",
                "Submit loan application form; bank evaluates and sanctions ₹10,000 collateral-free credit.",
                "Disbursement occurs directly into vendor's savings account within 7 to 10 working days."
            ],
            "applicationUrl": "https://pmsvanidhi.mohua.gov.in",
            "officialSourceUrl": "https://pmsvanidhi.mohua.gov.in/Home/AboutScheme",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000018"),
            "schemeName": "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
            "slug": "pradhan-mantri-jeevan-jyoti-bima-yojana",
            "description": "Government-backed life insurance scheme providing ₹2 Lakhs financial security cover to families of bank account holders in case of death due to any reason at just ₹436/year.",
            "objectives": [
                "Provide affordable life insurance coverage to underprivileged and unorganized segment workers.",
                "Protect families from falling into destitution upon untimely demise of breadwinner.",
                "Enable automated direct debit enrollment through existing savings bank accounts."
            ],
            "categoryId": ObjectId("661000000000000000000005"),
            "benefits": "Guaranteed sum assured of ₹2,00,000 paid to designated nominee in the event of subscriber's death due to any cause (natural or accidental) for an annual premium of just ₹436.",
            "targetBeneficiaries": "All Indian citizens having an individual savings bank account aged 18 to 50 years",
            "eligibility": {
                "summary": "Must be an Indian citizen aged between 18 and 50 years with an active savings bank account giving consent for auto-debit.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "age", "operator": ">=", "value": 18, "description": "Minimum entry age is 18 years"},
                        {"field": "age", "operator": "<=", "value": 50, "description": "Maximum entry age is 50 years"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Aadhaar Card", "description": "Identity and address proof", "mandatory": True},
                {"name": "Savings Bank Account", "description": "Account with auto-debit consent form", "mandatory": True},
                {"name": "Nominee KYC Documents", "description": "Identity proof and relationship details of nominee", "mandatory": True}
            ],
            "applicationProcedure": [
                "Visit your bank branch or log in to your bank's Internet Banking / Mobile App.",
                "Navigate to Insurance Services -> Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY).",
                "Select your savings account, review policy details, and nominate beneficiary.",
                "Provide consent for auto-debit of ₹436 yearly premium on or before 31st May.",
                "Policy certificate (COI) is generated instantly with bank reference number."
            ],
            "applicationUrl": "https://www.jansuraksha.gov.in",
            "officialSourceUrl": "https://financialservices.gov.in/insurance-divisions/Government-Sponsored-Socially-Oriented-Insurance-Schemes/Pradhan-Mantri-Jeevan-Jyoti-Bima-Yojana(PMJJBY)",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000019"),
            "schemeName": "Kisan Credit Card (KCC) Scheme",
            "slug": "kisan-credit-card-scheme",
            "description": "Provides farmers with institutional short-term credit at a highly subsidized interest rate of 4% per annum to meet crop cultivation, dairy, fisheries, and post-harvest expenses.",
            "objectives": [
                "Free farmers from high interest exploitation by non-institutional moneylenders.",
                "Provide flexible revolving cash credit limit to purchase seeds, fertilizers, and pesticides.",
                "Deliver interest subvention up to 3% for prompt loan repayment."
            ],
            "categoryId": ObjectId("661000000000000000000001"),
            "benefits": "Collateral-free agricultural loan up to ₹1.60 Lakhs (and up to ₹3 Lakhs with land mortgage) at an effective interest rate of only 4% per annum upon prompt repayment. Revolving credit valid for 5 years.",
            "targetBeneficiaries": "Individual/Joint farmers, tenant farmers, sharecroppers, and self-help groups (SHGs) of farmers including animal husbandry & fisheries farmers",
            "eligibility": {
                "summary": "All farmers growing agricultural crops, or raising livestock/poultry/fisheries aged between 18 and 75 years.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "occupation", "operator": "==", "value": "Farmer", "description": "Applicant must be an agricultural cultivator, dairy farmer, or fisherman"},
                        {"field": "age", "operator": ">=", "value": 18, "description": "Minimum age is 18 years"},
                        {"field": "age", "operator": "<=", "value": 75, "description": "Maximum age is 75 years (co-borrower required if age > 60)"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Land Record (ROR/Pahani/Adangal)", "description": "Proof of land holding and cropped area", "mandatory": True},
                {"name": "Aadhaar Card", "description": "Identity and address proof", "mandatory": True},
                {"name": "Passport Size Photographs", "description": "Two copies for bank application", "mandatory": True},
                {"name": "No-Dues Certificate", "description": "Confirmation of no overdue agricultural loans from other banks", "mandatory": False}
            ],
            "applicationProcedure": [
                "Download the simplified one-page KCC application form from pmkisan.gov.in or any commercial bank website.",
                "Fill land survey details, crop names, and expected cultivation acreage.",
                "Submit form to your nearest public/private bank branch or Common Service Centre (CSC).",
                "Bank inspects land records and sanctions Kisan Credit Card limit within 14 days.",
                "Withdraw funds as needed via RuPay Kisan Debit Card at any ATM."
            ],
            "applicationUrl": "https://myscheme.gov.in/schemes/kcc",
            "officialSourceUrl": "https://www.rbi.org.in/commonman/English/Scripts/BanksInIndia.aspx",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        },
        {
            "_id": ObjectId("662000000000000000000020"),
            "schemeName": "Merit-Cum-Means Scholarship for Professional & Technical Courses",
            "slug": "merit-cum-means-scholarship",
            "description": "Centrally sponsored scholarship scheme providing financial assistance to poor and meritorious students pursuing professional and technical graduation or post-graduation courses.",
            "objectives": [
                "Encourage economically weaker meritorious students to pursue expensive professional education (engineering, medicine, architecture, law).",
                "Provide direct tuition fee reimbursement and monthly living allowance.",
                "Reduce higher education dropout rates in professional degree colleges."
            ],
            "categoryId": ObjectId("661000000000000000000004"),
            "benefits": "Full course fee reimbursement up to ₹20,000 per annum plus monthly maintenance allowance of ₹1,000 per month (hostellers) or ₹500 per month (day scholars) for 10 months in an academic year.",
            "targetBeneficiaries": "College and University students enrolled in professional or technical degree courses",
            "eligibility": {
                "summary": "Must have secured minimum 50% marks in previous final examination and family annual income from all sources must not exceed ₹2,50,000.",
                "rule": {
                    "operator": "AND",
                    "conditions": [
                        {"field": "occupation", "operator": "==", "value": "Student", "description": "Applicant must currently be a student"},
                        {"field": "age", "operator": ">=", "value": 17, "description": "Minimum age is 17 years"},
                        {"field": "age", "operator": "<=", "value": 35, "description": "Maximum age is 35 years"},
                        {"field": "annualIncome", "operator": "<=", "value": 250000, "description": "Annual household income must be ≤ ₹2,50,000"}
                    ]
                }
            },
            "requiredDocuments": [
                {"name": "Previous Qualifying Exam Marksheet", "description": "Minimum 50% aggregate score", "mandatory": True},
                {"name": "College Fee Receipt & Admission Letter", "description": "Proof of admission in recognized professional course", "mandatory": True},
                {"name": "Income Certificate", "description": "Issued by Competent Revenue Authority (Tahsildar)", "mandatory": True},
                {"name": "Aadhaar Card", "description": "Mandatory identity proof", "mandatory": True},
                {"name": "Student Bank Passbook", "description": "Active Aadhaar-linked bank account in student's name", "mandatory": True}
            ],
            "applicationProcedure": [
                "Register on the National Scholarship Portal at scholarships.gov.in.",
                "Select 'Merit-Cum-Means Scholarship for Professional & Technical Courses'.",
                "Fill academic details, college institution AISHE code, and upload marksheet + income proof.",
                "Submit application online; institutional verification is conducted by your college nodal officer.",
                "District and State nodal officers approve sanction; scholarship is disbursed directly via DBT into student account."
            ],
            "applicationUrl": "https://scholarships.gov.in",
            "officialSourceUrl": "https://scholarships.gov.in/public/faq",
            "applicableStates": ["All India"],
            "isActive": True,
            "lastVerifiedAt": now,
            "createdAt": now,
            "updatedAt": now
        }
    ]

    db.schemes.insert_many(schemes_data)
    print(f"✅ {len(schemes_data)} verified government schemes seeded.")

    # 5. Seed Sample Application Record for Demo Citizen
    print("📋 Seeding sample application tracking records...")
    sample_app = {
        "_id": ObjectId("663000000000000000000001"),
        "userId": "660000000000000000000002",
        "schemeId": "662000000000000000000001",
        "schemeName": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        "referenceNumber": "PMKISAN-AP-2026-98124",
        "submissionDate": "2026-10-15",
        "currentStatus": "Under Verification",
        "notes": "Submitted through Village Revenue Officer. Land records verified, bank DBT mapping in progress.",
        "sourceType": "user_entered",
        "statusHistory": [
            {
                "status": "Submitted",
                "notes": "Application registered on official PM-KISAN portal.",
                "updatedAt": now - datetime.timedelta(days=25),
                "updatedBy": "Ravi Kumar Sharma"
            },
            {
                "status": "Under Verification",
                "notes": "Forwarded to District Agriculture Officer for land khatauni validation.",
                "updatedAt": now - datetime.timedelta(days=10),
                "updatedBy": "National Portal Administrator"
            }
        ],
        "createdAt": now - datetime.timedelta(days=25),
        "updatedAt": now - datetime.timedelta(days=10)
    }
    db.applications.insert_one(sample_app)

    # 6. Seed Sample Document Checklist
    db.document_checklists.insert_one({
        "userId": "660000000000000000000002",
        "schemeId": "662000000000000000000001",
        "documents": [
            {"name": "Aadhaar Card", "status": "Prepared", "mandatory": True},
            {"name": "Land Ownership Record (Khatauni/ROR)", "status": "Prepared", "mandatory": True},
            {"name": "Bank Account Passbook", "status": "Prepared", "mandatory": True},
            {"name": "Active Mobile Number", "status": "Not Prepared", "mandatory": True}
        ],
        "updatedAt": now
    })

    # 7. Seed Sample Saved Scheme
    db.saved_schemes.insert_one({
        "userId": "660000000000000000000002",
        "schemeId": "662000000000000000000002",
        "savedAt": now
    })

    # 8. Seed Initial Activity Logs
    db.activity_logs.insert_many([
        {
            "userId": "660000000000000000000002",
            "action": "REGISTER",
            "description": "Account created successfully",
            "timestamp": now - datetime.timedelta(days=30)
        },
        {
            "userId": "660000000000000000000002",
            "action": "SAVE_SCHEME",
            "description": "Saved Ayushman Bharat PM-JAY to bookmarks",
            "timestamp": now - datetime.timedelta(days=15)
        },
        {
            "userId": "660000000000000000000002",
            "action": "CREATE_APPLICATION_RECORD",
            "description": "Recorded PM-KISAN application (Ref: PMKISAN-AP-2026-98124)",
            "timestamp": now - datetime.timedelta(days=25)
        }
    ])

    print("🎉 Database seeding completed successfully!")
    print(f"📊 Summary:")
    print(f"   • Users: {db.users.count_documents({})}")
    print(f"   • Categories: {db.categories.count_documents({})}")
    print(f"   • Schemes: {db.schemes.count_documents({})}")
    print(f"   • Applications: {db.applications.count_documents({})}")
    print(f"   • Saved Schemes: {db.saved_schemes.count_documents({})}")

if __name__ == "__main__":
    run_seed()
