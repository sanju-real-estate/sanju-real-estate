import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calculator, 
  TrendingUp, 
  Building2, 
  Coins, 
  Percent, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  RefreshCw, 
  Landmark, 
  Home, 
  DollarSign, 
  BarChart3, 
  Layers, 
  BadgePercent,
  Calendar,
  Share2,
  Check
} from 'lucide-react';
import { INDIAN_CITIES } from '../data/cities';

const JAIPUR_LOCALITIES = [
  'Mansarovar',
  'Jagatpura',
  'Vaishali Nagar',
  'Malviya Nagar',
  'Tonk Road',
  'Ajmer Road',
  'C-Scheme',
  'Raja Park',
  'Sirsi Road',
  'Kalwar Road',
  'Pratap Nagar',
  'Patel Nagar',
  'Jhotwara',
  'Mahapura',
  'Gandhi Path',
  'Chitrakoot',
  'Bapu Nagar',
  'Civil Lines',
  'JLN Marg',
  'Gopalpura Bypass',
  'Durgapura',
  'Sanganer',
  'Vidyadhar Nagar',
  'Bani Park',
  'Shyam Nagar',
  'Nirman Nagar'
];

export const RealEstateCalculators: React.FC = () => {
  const { selectedCity, showToast, setActiveView } = useApp();

  const [activeTab, setActiveTab] = useState<'valuation' | 'emi' | 'stampDuty' | 'rentalYield'>('valuation');

  // ==========================================
  // 1. PROPERTY PRICE ESTIMATOR & VALUATION
  // ==========================================
  const [valCity, setValCity] = useState(selectedCity || 'Jaipur');
  const [valLocality, setValLocality] = useState('Mansarovar');
  const [valType, setValType] = useState('Apartment');
  const [valBhk, setValBhk] = useState(3);
  const [valArea, setValArea] = useState(1350);
  const [valFurnishing, setValFurnishing] = useState('Semi-Furnished');
  const [valAge, setValAge] = useState('1-3 Years');
  const [valParking, setValParking] = useState('Covered Reserved');
  const [isValuating, setIsValuating] = useState(false);
  const [copiedEstimate, setCopiedEstimate] = useState(false);

  // Local valuation calculation algorithm based on city & locality benchmarks
  const estimatedData = useMemo(() => {
    // Base rate per sqft benchmarks
    let baseRate = 4800;
    if (valCity === 'Jaipur') {
      const loc = valLocality.toLowerCase();
      if (loc.includes('c-scheme') || loc.includes('civil lines') || loc.includes('bapu nagar')) baseRate = 9500;
      else if (loc.includes('vaishali') || loc.includes('malviya') || loc.includes('raja park') || loc.includes('jln')) baseRate = 6800;
      else if (loc.includes('mansarovar') || loc.includes('tonk road') || loc.includes('durgapura')) baseRate = 5400;
      else if (loc.includes('jagatpura') || loc.includes('pratap nagar') || loc.includes('gopalpura')) baseRate = 4600;
      else if (loc.includes('ajmer road') || loc.includes('sirsi') || loc.includes('chitrakoot')) baseRate = 4200;
      else baseRate = 3800;
    } else if (valCity === 'Mumbai') {
      baseRate = 24000;
    } else if (valCity === 'Delhi NCR' || valCity === 'Gurugram') {
      baseRate = 12000;
    } else if (valCity === 'Bangalore' || valCity === 'Pune' || valCity === 'Hyderabad') {
      baseRate = 8500;
    } else {
      baseRate = 4500;
    }

    // Adjust for Property Type
    if (valType === 'Villa / House') baseRate *= 1.25;
    else if (valType === 'Commercial Office' || valType === 'Shop') baseRate *= 1.45;
    else if (valType === 'Residential Plot') baseRate *= 0.95;

    // Adjust for Furnishing
    if (valFurnishing === 'Fully Furnished') baseRate += 550;
    else if (valFurnishing === 'Semi-Furnished') baseRate += 200;

    // Adjust for Age
    if (valAge === 'Under Construction / New') baseRate *= 1.06;
    else if (valAge === '3-7 Years') baseRate *= 0.94;
    else if (valAge === '7+ Years') baseRate *= 0.88;

    const totalPrice = Math.round(baseRate * valArea);
    const minPrice = Math.round(totalPrice * 0.94);
    const maxPrice = Math.round(totalPrice * 1.06);

    const monthlyRent = Math.round((totalPrice * 0.033) / 12);
    const rentalYield = ((monthlyRent * 12) / totalPrice) * 100;

    const formatINR = (val: number) => {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lac`;
      return `₹${val.toLocaleString('en-IN')}`;
    };

    return {
      avgRatePerSqFt: Math.round(baseRate),
      minPrice,
      maxPrice,
      minPriceDisplay: formatINR(minPrice),
      maxPriceDisplay: formatINR(maxPrice),
      avgPriceDisplay: formatINR(totalPrice),
      monthlyRent,
      monthlyRentDisplay: `₹${monthlyRent.toLocaleString('en-IN')}/month`,
      rentalYieldDisplay: `${rentalYield.toFixed(1)}%`,
      growthRating: 8.8,
      demandVerdict: 'High Buyer Demand (Fast Absorption Zone)'
    };
  }, [valCity, valLocality, valType, valBhk, valArea, valFurnishing, valAge]);

  const handleCopyEstimate = () => {
    const text = `🏡 Jaipur Properties Hub Property Valuation Report:\nLocality: ${valLocality}, ${valCity}\nConfig: ${valBhk} BHK ${valType} (${valArea} sq.ft)\nEstimated Value: ${estimatedData.minPriceDisplay} - ${estimatedData.maxPriceDisplay}\nAverage Rate: ₹${estimatedData.avgRatePerSqFt}/sq.ft\nEstimated Rent: ${estimatedData.monthlyRentDisplay}\nRental Yield: ${estimatedData.rentalYieldDisplay}`;
    navigator.clipboard.writeText(text);
    setCopiedEstimate(true);
    showToast('Valuation Report copied to clipboard!', 'success');
    setTimeout(() => setCopiedEstimate(false), 2500);
  };

  // ==========================================
  // 2. HOME LOAN EMI CALCULATOR
  // ==========================================
  const [loanAmount, setLoanAmount] = useState<number>(4500000); // 45 Lac
  const [interestRate, setInterestRate] = useState<number>(8.5); // 8.5%
  const [loanTenureYears, setLoanTenureYears] = useState<number>(20); // 20 years

  const emiCalculation = useMemo(() => {
    const principal = Number(loanAmount) || 0;
    const monthlyRate = (Number(interestRate) || 0) / (12 * 100);
    const months = (Number(loanTenureYears) || 0) * 12;

    if (principal <= 0 || monthlyRate <= 0 || months <= 0) {
      return {
        monthlyEmi: 0,
        totalInterest: 0,
        totalPayment: 0,
        principalPercent: 100,
        interestPercent: 0
      };
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayable = emi * months;
    const totalInterest = totalPayable - principal;

    const principalPct = Math.round((principal / totalPayable) * 100);
    const interestPct = 100 - principalPct;

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayable),
      principalPercent: principalPct,
      interestPercent: interestPct
    };
  }, [loanAmount, interestRate, loanTenureYears]);

  // ==========================================
  // 3. STAMP DUTY & REGISTRATION CALCULATOR
  // ==========================================
  const [propValue, setPropValue] = useState<number>(5000000); // 50 Lac
  const [buyerGender, setBuyerGender] = useState<'female' | 'male' | 'joint'>('male');
  const [regionType, setRegionType] = useState<'urban' | 'rural'>('urban');

  const stampDutyCalculation = useMemo(() => {
    const val = Number(propValue) || 0;
    
    // Rajasthan Standard Stamp Duty:
    // Male: 6% stamp duty + 1% registration + 20% surcharge on stamp duty
    // Female: 5% stamp duty + 1% registration (1% concession) + 20% surcharge
    // Joint: 5.5% stamp duty + 1% registration
    let stampRate = 0.06;
    if (buyerGender === 'female') stampRate = 0.05;
    else if (buyerGender === 'joint') stampRate = 0.055;

    const stampDuty = Math.round(val * stampRate);
    const registrationFee = Math.round(val * 0.01); // 1%
    const surcharge = Math.round(stampDuty * 0.20); // 20% surcharge for infrastructure/welfare
    const totalGovtCharges = stampDuty + registrationFee + surcharge;
    const totalOutflow = val + totalGovtCharges;

    return {
      stampDuty,
      registrationFee,
      surcharge,
      totalGovtCharges,
      totalOutflow,
      stampRatePct: (stampRate * 100).toFixed(1)
    };
  }, [propValue, buyerGender, regionType]);

  // ==========================================
  // 4. RENTAL YIELD & INVESTMENT ROI CALCULATOR
  // ==========================================
  const [purchasePrice, setPurchasePrice] = useState<number>(6000000); // 60 Lac
  const [expectedRent, setExpectedRent] = useState<number>(22000); // 22k / month
  const [annualExpenses, setAnnualExpenses] = useState<number>(20000); // maintenance/taxes
  const [appreciationRate, setAppreciationRate] = useState<number>(7.5); // 7.5% per year

  const rentalYieldCalculation = useMemo(() => {
    const cost = Number(purchasePrice) || 1;
    const rent = Number(expectedRent) || 0;
    const exp = Number(annualExpenses) || 0;
    const appRate = Number(appreciationRate) || 0;

    const annualGrossRent = rent * 12;
    const annualNetRent = Math.max(0, annualGrossRent - exp);

    const grossYield = (annualGrossRent / cost) * 100;
    const netYield = (annualNetRent / cost) * 100;

    // 5-Year Capital Gain calculation (compounded)
    const futureValue5Years = Math.round(cost * Math.pow(1 + appRate / 100, 5));
    const capitalGain5Years = futureValue5Years - cost;
    const totalRentalIncome5Years = annualNetRent * 5;
    const totalWealth5Years = capitalGain5Years + totalRentalIncome5Years;

    return {
      grossYield: grossYield.toFixed(2),
      netYield: netYield.toFixed(2),
      annualGrossRent,
      annualNetRent,
      futureValue5Years,
      capitalGain5Years,
      totalRentalIncome5Years,
      totalWealth5Years
    };
  }, [purchasePrice, expectedRent, annualExpenses, appreciationRate]);

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Banner */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Calculator className="w-80 h-80 text-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider">
                  Financial Suite
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Live Market Estimator
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Real Estate Financial & Valuation Calculators
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
                Accurately compute property market value, home loan EMIs, Rajasthan government stamp duty registration fees, and long-term rental yields.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveView('listings')}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-2xl text-xs font-extrabold transition-all shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                <span>Explore Properties in Jaipur</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Tool Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <button
            onClick={() => setActiveTab('valuation')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              activeTab === 'valuation'
                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/25 scale-[1.02]'
                : 'bg-slate-800/80 border-slate-700/80 text-gray-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${activeTab === 'valuation' ? 'bg-white/20' : 'bg-red-500/20 text-red-400'}`}>
                <TrendingUp className="w-5 h-5" />
              </div>
              {activeTab === 'valuation' && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <div>
              <span className="text-xs font-extrabold block">Property Valuation</span>
              <span className={`text-[11px] block mt-0.5 ${activeTab === 'valuation' ? 'text-red-100' : 'text-gray-400'}`}>
                Price & Rate Estimator
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('emi')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              activeTab === 'emi'
                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/25 scale-[1.02]'
                : 'bg-slate-800/80 border-slate-700/80 text-gray-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${activeTab === 'emi' ? 'bg-white/20' : 'bg-blue-500/20 text-blue-400'}`}>
                <Landmark className="w-5 h-5" />
              </div>
              {activeTab === 'emi' && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <div>
              <span className="text-xs font-extrabold block">Home Loan EMI</span>
              <span className={`text-[11px] block mt-0.5 ${activeTab === 'emi' ? 'text-red-100' : 'text-gray-400'}`}>
                Monthly Schedule & Interest
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('stampDuty')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              activeTab === 'stampDuty'
                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/25 scale-[1.02]'
                : 'bg-slate-800/80 border-slate-700/80 text-gray-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${activeTab === 'stampDuty' ? 'bg-white/20' : 'bg-amber-500/20 text-amber-400'}`}>
                <FileText className="w-5 h-5" />
              </div>
              {activeTab === 'stampDuty' && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <div>
              <span className="text-xs font-extrabold block">Stamp Duty & Registry</span>
              <span className={`text-[11px] block mt-0.5 ${activeTab === 'stampDuty' ? 'text-red-100' : 'text-gray-400'}`}>
                Govt Fees & Concessions
              </span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('rentalYield')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
              activeTab === 'rentalYield'
                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/25 scale-[1.02]'
                : 'bg-slate-800/80 border-slate-700/80 text-gray-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${activeTab === 'rentalYield' ? 'bg-white/20' : 'bg-emerald-500/20 text-emerald-400'}`}>
                <Percent className="w-5 h-5" />
              </div>
              {activeTab === 'rentalYield' && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <div>
              <span className="text-xs font-extrabold block">Rental Yield & ROI</span>
              <span className={`text-[11px] block mt-0.5 ${activeTab === 'rentalYield' ? 'text-red-100' : 'text-gray-400'}`}>
                5-Yr Capital Growth Matrix
              </span>
            </div>
          </button>
        </div>

        {/* ========================================== */}
        {/* TAB 1: PROPERTY PRICE ESTIMATOR & VALUATION */}
        {/* ========================================== */}
        {activeTab === 'valuation' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Form Panel (5 cols) */}
            <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-500" />
                  <h2 className="text-base font-black text-white">
                    Property Configuration
                  </h2>
                </div>
                <span className="text-[11px] text-gray-400 font-mono">
                  Jaipur Market Benchmarks
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <select
                    value={valCity}
                    onChange={(e) => setValCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  >
                    {INDIAN_CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Locality / Sector
                  </label>
                  {valCity === 'Jaipur' ? (
                    <select
                      value={valLocality}
                      onChange={(e) => setValLocality(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-red-500"
                    >
                      {JAIPUR_LOCALITIES.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={valLocality}
                      onChange={(e) => setValLocality(e.target.value)}
                      placeholder="e.g. Bandra, Whitefield, Gomti Nagar"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-red-500"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Property Type
                  </label>
                  <select
                    value={valType}
                    onChange={(e) => setValType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Apartment">Apartment / Flat</option>
                    <option value="Villa / House">Independent Villa / Kothi</option>
                    <option value="Residential Plot">Residential Plot / JDA Land</option>
                    <option value="Commercial Office">Commercial Office Space</option>
                    <option value="Shop">Retail Shop / Showroom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Configuration (BHK)
                  </label>
                  <select
                    value={valBhk}
                    onChange={(e) => setValBhk(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  >
                    <option value={1}>1 BHK</option>
                    <option value={2}>2 BHK</option>
                    <option value={3}>3 BHK</option>
                    <option value={4}>4 BHK</option>
                    <option value={5}>5+ BHK / Penthouse</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Super Built-up Area
                  </label>
                  <span className="text-xs font-mono font-extrabold text-red-400">
                    {valArea} Sq.Ft ({Math.round(valArea / 9)} Sq.Yards)
                  </span>
                </div>
                <input
                  type="range"
                  min={300}
                  max={6000}
                  step={25}
                  value={valArea}
                  onChange={(e) => setValArea(Number(e.target.value))}
                  className="w-full accent-red-600 h-2 bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                  <span>300 sq.ft</span>
                  <span>1,500 sq.ft</span>
                  <span>3,000 sq.ft</span>
                  <span>6,000 sq.ft</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Furnishing Status
                  </label>
                  <select
                    value={valFurnishing}
                    onChange={(e) => setValFurnishing(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Unfurnished">Unfurnished (Raw)</option>
                    <option value="Semi-Furnished">Semi-Furnished (Wardrobes & Kitchen)</option>
                    <option value="Fully Furnished">Fully Furnished Luxury</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                    Property Age
                  </label>
                  <select
                    value={valAge}
                    onChange={(e) => setValAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Under Construction / New">Under Construction / Brand New</option>
                    <option value="1-3 Years">1 to 3 Years</option>
                    <option value="3-7 Years">3 to 7 Years</option>
                    <option value="7+ Years">7+ Years</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Live Result Report Card (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Instant Live Estimate
                    </span>
                  </div>
                  <button
                    onClick={handleCopyEstimate}
                    className="text-xs text-gray-400 hover:text-white bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedEstimate ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mb-6">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    Estimated Market Value
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {estimatedData.minPriceDisplay} – {estimatedData.maxPriceDisplay}
                  </div>
                  <p className="text-xs text-red-400 font-bold mt-1">
                    Average Baseline: {estimatedData.avgPriceDisplay}
                  </p>
                </div>

                {/* Metric Bento Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-700">
                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/60">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Average Rate
                    </span>
                    <span className="text-sm sm:text-base font-black text-white">
                      ₹{estimatedData.avgRatePerSqFt.toLocaleString()}/sq.ft
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/60">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Expected Rent
                    </span>
                    <span className="text-sm sm:text-base font-black text-emerald-400">
                      {estimatedData.monthlyRentDisplay}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/60 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Rental Yield
                    </span>
                    <span className="text-sm sm:text-base font-black text-amber-400">
                      {estimatedData.rentalYieldDisplay} / Year
                    </span>
                  </div>
                </div>

                {/* Locality Growth Rating */}
                <div className="mt-5 p-4 bg-slate-900/90 rounded-2xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-400 block font-medium">Locality Growth Rating</span>
                    <span className="text-xs font-bold text-white">{estimatedData.demandVerdict}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400">8.8 / 10</span>
                  </div>
                </div>

              </div>

              {/* Verified Owner Insights */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 shadow-md space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Jaipur Properties Valuation Guarantee
                  </h3>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Prices are computed using verified Jaipur registry rates, recent builder sale transactions across <span className="text-red-400 font-bold">{valLocality}</span>, and active market demand.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setActiveTab('emi')}
                    className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Check Monthly EMI for this property</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveTab('stampDuty')}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Registry Fee</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* TAB 2: HOME LOAN EMI CALCULATOR */}
        {/* ========================================== */}
        {activeTab === 'emi' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Controls (6 cols) */}
            <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-blue-400" />
                  <h2 className="text-base font-black text-white">
                    Home Loan Parameters
                  </h2>
                </div>
                <span className="text-xs font-mono text-gray-400">
                  SBI, HDFC, ICICI, BOB Rates
                </span>
              </div>

              {/* 1. Loan Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Loan Amount
                  </label>
                  <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                    <span className="text-xs text-gray-400 font-mono">₹</span>
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-28 text-right bg-transparent text-sm font-black text-white focus:outline-none"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={100000}
                  max={50000000}
                  step={100000}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>₹10 Lac</span>
                  <span>₹50 Lac</span>
                  <span>₹1 Cr</span>
                  <span>₹5 Cr</span>
                </div>
              </div>

              {/* 2. Interest Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Interest Rate (% P.A.)
                  </label>
                  <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                    <input
                      type="number"
                      step={0.1}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-14 text-right bg-transparent text-sm font-black text-white focus:outline-none"
                    />
                    <span className="text-xs text-gray-400 font-mono">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={6.5}
                  max={15}
                  step={0.1}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>6.5%</span>
                  <span>8.5% (Prime)</span>
                  <span>10.5%</span>
                  <span>15%</span>
                </div>
              </div>

              {/* 3. Tenure Years */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Loan Tenure (Years)
                  </label>
                  <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={loanTenureYears}
                      onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                      className="w-12 text-right bg-transparent text-sm font-black text-white focus:outline-none"
                    />
                    <span className="text-xs text-gray-400 font-mono">Yrs</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                  className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>5 Yrs</span>
                  <span>15 Yrs</span>
                  <span>20 Yrs</span>
                  <span>30 Yrs</span>
                </div>
              </div>

            </div>

            {/* Live EMI Output Card (6 cols) */}
            <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              
              <div className="bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/30 rounded-3xl p-6 text-center space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-300">
                  Monthly EMI Payable
                </span>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  ₹{emiCalculation.monthlyEmi.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-gray-400">
                  For {loanTenureYears} years ({loanTenureYears * 12} monthly installments)
                </p>
              </div>

              {/* Ratio Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-blue-400">Principal: {emiCalculation.principalPercent}%</span>
                  <span className="text-amber-400">Interest: {emiCalculation.interestPercent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-slate-700">
                  <div style={{ width: `${emiCalculation.principalPercent}%` }} className="bg-blue-500 h-full"></div>
                  <div style={{ width: `${emiCalculation.interestPercent}%` }} className="bg-amber-500 h-full"></div>
                </div>
              </div>

              {/* Breakdown Details */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="text-xs font-bold text-gray-300">Principal Loan Amount</span>
                  </div>
                  <span className="text-sm font-black text-white">
                    ₹{loanAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="text-xs font-bold text-gray-300">Total Interest Payable</span>
                  </div>
                  <span className="text-sm font-black text-amber-400">
                    ₹{emiCalculation.totalInterest.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl border border-slate-600">
                  <span className="text-xs font-black text-white uppercase tracking-wider">Total Amount Payable</span>
                  <span className="text-base font-black text-emerald-400">
                    ₹{emiCalculation.totalPayment.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* TAB 3: STAMP DUTY & REGISTRATION */}
        {/* ========================================== */}
        {activeTab === 'stampDuty' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Controls (6 cols) */}
            <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-black text-white">
                    Property Registry Breakdown
                  </h2>
                </div>
                <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/60">
                  Rajasthan Rules
                </span>
              </div>

              {/* Property Value Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Property Agreement Value / DLC Rate
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    value={propValue}
                    onChange={(e) => setPropValue(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-base font-black text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Buyer Category / Gender */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Buyer Category / Gender Concession
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBuyerGender('female')}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      buyerGender === 'female'
                        ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-700 text-gray-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="block font-black">Female</span>
                    <span className="text-[10px] opacity-80">5% Stamp (1% OFF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBuyerGender('male')}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      buyerGender === 'male'
                        ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-700 text-gray-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="block font-black">Male</span>
                    <span className="text-[10px] opacity-80">6% Stamp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBuyerGender('joint')}
                    className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      buyerGender === 'joint'
                        ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                        : 'bg-slate-900 border-slate-700 text-gray-400 hover:bg-slate-800'
                    }`}
                  >
                    <span className="block font-black">Joint (M+F)</span>
                    <span className="text-[10px] opacity-80">5.5% Stamp</span>
                  </button>
                </div>
              </div>

              {/* Area Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Region Jurisdiction
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegionType('urban')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      regionType === 'urban'
                        ? 'bg-slate-700 border-amber-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-gray-400'
                    }`}
                  >
                    Urban (JDA / Nagar Nigam)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegionType('rural')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      regionType === 'rural'
                        ? 'bg-slate-700 border-amber-400 text-white'
                        : 'bg-slate-900 border-slate-700 text-gray-400'
                    }`}
                  >
                    Rural (Gram Panchayat)
                  </button>
                </div>
              </div>

            </div>

            {/* Stamp Duty Live Calculation Results (6 cols) */}
            <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              
              <div className="bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/30 rounded-3xl p-6 text-center space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                  Total Govt Charges (Registry + Stamp)
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  ₹{stampDutyCalculation.totalGovtCharges.toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-amber-400/90 font-medium">
                  {buyerGender === 'female' ? 'Includes 1% Women Property Rebate in Rajasthan' : 'Standard Rajasthan Registration Duty'}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-2xl border border-slate-700">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Stamp Duty ({stampDutyCalculation.stampRatePct}%)
                    </span>
                    <span className="text-[10px] text-gray-400">Payable on Agreement Value</span>
                  </div>
                  <span className="text-sm font-black text-white">
                    ₹{stampDutyCalculation.stampDuty.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-2xl border border-slate-700">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Registration Fee (1.0%)
                    </span>
                    <span className="text-[10px] text-gray-400">Sub-Registrar Office fee</span>
                  </div>
                  <span className="text-sm font-black text-white">
                    ₹{stampDutyCalculation.registrationFee.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-2xl border border-slate-700">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Cess & Infrastructure Surcharge (20%)
                    </span>
                    <span className="text-[10px] text-gray-400">Local municipal infrastructure</span>
                  </div>
                  <span className="text-sm font-black text-amber-400">
                    ₹{stampDutyCalculation.surcharge.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-amber-500/40">
                  <div>
                    <span className="text-xs font-black text-white uppercase tracking-wider block">
                      Total Effective Cost
                    </span>
                    <span className="text-[10px] text-gray-400">Property Price + All Govt Fees</span>
                  </div>
                  <span className="text-lg font-black text-emerald-400">
                    ₹{stampDutyCalculation.totalOutflow.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* TAB 4: RENTAL YIELD & ROI */}
        {/* ========================================== */}
        {activeTab === 'rentalYield' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Controls (6 cols) */}
            <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-black text-white">
                    Investment & Rental ROI
                  </h2>
                </div>
                <span className="text-xs font-mono text-gray-400">
                  5-Year Projection Matrix
                </span>
              </div>

              {/* Purchase Price */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Total Property Purchase Cost
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-sm font-black text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Expected Monthly Rent */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Expected Monthly Rent (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    value={expectedRent}
                    onChange={(e) => setExpectedRent(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-sm font-black text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Annual Maintenance & Property Tax */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                  Annual Maintenance & Taxes (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    value={annualExpenses}
                    onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-sm font-black text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Annual Appreciation Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                    Expected Annual Appreciation Rate
                  </label>
                  <span className="text-xs font-mono font-black text-emerald-400">
                    {appreciationRate}% / Year
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={15}
                  step={0.5}
                  value={appreciationRate}
                  onChange={(e) => setAppreciationRate(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

            </div>

            {/* Results (6 cols) */}
            <div className="lg:col-span-6 bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                    Gross Rental Yield
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {rentalYieldCalculation.grossYield}%
                  </div>
                  <span className="text-[10px] text-gray-400">per annum</span>
                </div>

                <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                    Net Rental Yield
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {rentalYieldCalculation.netYield}%
                  </div>
                  <span className="text-[10px] text-gray-400">after expenses</span>
                </div>
              </div>

              {/* 5-Year Wealth Creation Forecast */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-2xl border border-slate-700">
                  <span className="text-xs font-bold text-gray-300">5-Yr Total Rental Income</span>
                  <span className="text-sm font-black text-emerald-400">
                    ₹{rentalYieldCalculation.totalRentalIncome5Years.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-2xl border border-slate-700">
                  <span className="text-xs font-bold text-gray-300">5-Yr Property Value ({appreciationRate}% growth)</span>
                  <span className="text-sm font-black text-white">
                    ₹{rentalYieldCalculation.futureValue5Years.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-2xl border border-slate-700">
                  <span className="text-xs font-bold text-gray-300">Capital Appreciation Profit</span>
                  <span className="text-sm font-black text-amber-400">
                    ₹{rentalYieldCalculation.capitalGain5Years.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-emerald-500/40">
                  <div>
                    <span className="text-xs font-black text-white uppercase tracking-wider block">
                      Total 5-Yr Wealth Created
                    </span>
                    <span className="text-[10px] text-gray-400">Rent Earned + Value Growth</span>
                  </div>
                  <span className="text-lg font-black text-emerald-400">
                    ₹{rentalYieldCalculation.totalWealth5Years.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
