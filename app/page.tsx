'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Database,
  Leaf,
  Menu,
  PanelLeft,
  RefreshCw,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  X,
} from 'lucide-react'

type Meal = { name: string; description: string; cost: string; protein: string; kcal: string; tags: string[] }
type OptimizerMode = 'demo' | 'backend'
type OptimizationResult = { dailyCost: number; budgetRemaining: number; nutritionCoverage: number; ironCoverage: number; changeSummary: string }

function optimizePlan(input: { budget: number; ingredientsAvailable: boolean; mode: OptimizerMode }): OptimizationResult {
  if (input.mode === 'backend') {
    return { dailyCost: 17420, budgetRemaining: Math.max(input.budget - 17420, 0), nutritionCoverage: 92, ironCoverage: 84, changeSummary: 'Backend service connection is ready for the production optimizer.' }
  }

  const constrainedBudget = Math.min(Math.max(input.budget, 12000), 18000)
  const isTighterBudget = constrainedBudget < 16000
  return {
    dailyCost: isTighterBudget ? 14860 : 17420,
    budgetRemaining: Math.max(constrainedBudget - (isTighterBudget ? 14860 : 17420), 0),
    nutritionCoverage: isTighterBudget ? 89 : 92,
    ironCoverage: isTighterBudget ? 82 : 84,
    changeSummary: isTighterBudget ? 'Paneer Curry → Chana Curry. Lower cost while maintaining dietary compatibility.' : 'The current plan already fits the selected budget and constraints.',
  }
}

const mealDetails: Record<string, Meal> = {
  'Idli + Milk': { name: 'Idli + Milk', description: 'Steamed rice cakes with a serving of milk.', cost: '₹18', protein: '11g', kcal: '420 kcal', tags: ['Vegetarian', 'Available ingredients'] },
  'Rice + Dal + Vegetable Curry': { name: 'Rice + Dal + Vegetable Curry', description: 'A balanced combination of rice, lentils and seasonal vegetables.', cost: '₹32', protein: '18g', kcal: '620 kcal', tags: ['Vegetarian', 'High fibre'] },
  'Chapati + Chana Curry': { name: 'Chapati + Chana Curry', description: 'Whole wheat chapati served with a protein-rich chickpea curry.', cost: '₹32', protein: '17g', kcal: '610 kcal', tags: ['Vegetarian', 'High protein'] },
  'Upma + Banana': { name: 'Upma + Banana', description: 'Savory semolina upma with one banana.', cost: '₹16', protein: '8g', kcal: '390 kcal', tags: ['Vegetarian', 'Available ingredients'] },
  'Rice + Sambar': { name: 'Rice + Sambar', description: 'Steamed rice with lentil and vegetable sambar.', cost: '₹29', protein: '15g', kcal: '570 kcal', tags: ['Vegetarian', 'High fibre'] },
  'Rice + Vegetable Curry': { name: 'Rice + Vegetable Curry', description: 'Steamed rice with a seasonal vegetable curry.', cost: '₹27', protein: '10g', kcal: '540 kcal', tags: ['Vegetarian'] },
  'Dosa + Milk': { name: 'Dosa + Milk', description: 'Crisp fermented rice and lentil dosa with milk.', cost: '₹21', protein: '12g', kcal: '440 kcal', tags: ['Vegetarian'] },
  'Rice + Chana': { name: 'Rice + Chana', description: 'Rice served with chickpeas and vegetables.', cost: '₹32', protein: '17g', kcal: '610 kcal', tags: ['Vegetarian', 'High protein'] },
  'Chapati + Dal': { name: 'Chapati + Dal', description: 'Whole wheat chapati with slow-cooked lentils.', cost: '₹29', protein: '15g', kcal: '580 kcal', tags: ['Vegetarian', 'High fibre'] },
  'Pongal': { name: 'Pongal', description: 'Comforting rice and lentil breakfast.', cost: '₹19', protein: '10g', kcal: '410 kcal', tags: ['Vegetarian'] },
  'Rice + Dal': { name: 'Rice + Dal', description: 'Steamed rice with seasoned lentils.', cost: '₹28', protein: '16g', kcal: '590 kcal', tags: ['Vegetarian', 'Available ingredients'] },
  'Vegetable Rice': { name: 'Vegetable Rice', description: 'Rice tossed with seasonal vegetables.', cost: '₹27', protein: '10g', kcal: '530 kcal', tags: ['Vegetarian'] },
  'Vegetable Curry': { name: 'Vegetable Curry', description: 'Seasonal vegetables in a lightly spiced gravy.', cost: '₹25', protein: '8g', kcal: '480 kcal', tags: ['Vegetarian'] },
}

const plan = [
  ['MON', 'Idli + Milk', 'Rice + Dal + Vegetable Curry', 'Chapati + Chana Curry'],
  ['TUE', 'Upma + Banana', 'Rice + Sambar', 'Rice + Vegetable Curry'],
  ['WED', 'Dosa + Milk', 'Rice + Dal', 'Chapati + Dal'],
  ['THU', 'Pongal', 'Rice + Chana', 'Chapati + Vegetable Curry'],
  ['FRI', 'Idli + Banana', 'Rice + Dal', 'Vegetable Rice'],
  ['SAT', 'Upma + Milk', 'Rice + Sambar', 'Chapati + Dal'],
  ['SUN', 'Dosa + Banana', 'Rice + Chana', 'Vegetable Curry'],
]

const ingredients = [
  ['Rice', '100', 'kg', '₹45/kg', true],
  ['Dal', '30', 'kg', '₹110/kg', true],
  ['Vegetables', '50', 'kg', '₹60/kg', true],
  ['Milk', '50', 'L', '₹55/L', true],
  ['Banana', '200', 'units', '₹6/unit', true],
  ['Groundnut', '15', 'kg', '₹140/kg', true],
]

function ProgressBar({ value, tone = 'green' }: { value: number; tone?: 'green' | 'amber' }) {
  return <div className="progress-track"><div className={`progress-fill ${tone}`} style={{ width: `${value}%` }} /><span>{value}%</span></div>
}

export default function Page() {
  const [active, setActive] = useState('Meal Plan')
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const [whatIfOpen, setWhatIfOpen] = useState(false)
  const [budget, setBudget] = useState(15000)
  const [reoptimized, setReoptimized] = useState(false)
  const [ingredientsOpen, setIngredientsOpen] = useState(false)
  const [optimizerMode, setOptimizerMode] = useState<OptimizerMode>('demo')
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult>(() => optimizePlan({ budget: 15000, ingredientsAvailable: true, mode: 'demo' }))

  const nav = [
    { label: 'Overview', icon: BarChart3 },
    { label: 'Plan Setup', icon: ClipboardList },
    { label: 'Ingredients', icon: Database },
    { label: 'Meal Plan', icon: Utensils },
    { label: 'What-If', icon: SlidersHorizontal },
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Leaf size={17} strokeWidth={2.5} /></div><span>NutriPlan</span></div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-switch"><div className="workspace-avatar">CH</div><div><strong>College Hostel</strong><small>Week 1 planning</small></div><ChevronDown size={15} /></div>
        <nav aria-label="Main navigation"><div className="nav-label">PLAN</div>{nav.map(({ label, icon: Icon }) => <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => { setActive(label); if (label === 'What-If') setWhatIfOpen(true) }}><Icon size={17} /><span>{label}</span>{label === 'Meal Plan' && <span className="nav-dot" />}</button>)}</nav>
        <div className="sidebar-bottom"><button className="nav-item"><Settings2 size={17} /><span>Settings</span></button><div className="help-box"><CircleHelp size={17} /><div><strong>Need help?</strong><span>Read the planning guide</span></div><ChevronRight size={15} /></div><div className="version">NutriPlan demo · v0.1</div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><button className="mobile-menu" aria-label="Open menu"><Menu size={19} /></button><div className="breadcrumb"><span>Plans</span><ChevronRight size={14} /><strong>Week 1</strong></div><div className="topbar-actions"><span className="mode-badge"><span className="status-dot" />{optimizerMode === 'demo' ? 'Demo / mock mode' : 'Backend mode'}</span><span className="saved"><span className="status-dot" />All changes saved</span><button className="icon-button" aria-label="Toggle sidebar"><PanelLeft size={17} /></button><div className="user-avatar">AS</div></div></header>
        <div className="page-wrap">
          <div className="page-heading"><div><div className="eyebrow">WEEK 1 · 7 DAYS <span className="pill success"><Check size={12} /> Feasible</span></div><h1>Your optimized meal plan</h1><p>A practical plan for 500 people, balanced across cost, nutrition, and available ingredients.</p></div><div className="heading-actions"><button className="mode-toggle" onClick={() => setOptimizerMode(optimizerMode === 'demo' ? 'backend' : 'demo')}><Database size={15} /> Use {optimizerMode === 'demo' ? 'backend' : 'demo'} mode</button><button className="outline-button" onClick={() => setWhatIfOpen(true)}><SlidersHorizontal size={16} /> What if something changes?</button></div></div>

          <section className="summary-grid" aria-label="Plan summary"><div className="summary-card primary"><span>Daily cost</span><strong>₹{optimizationResult.dailyCost.toLocaleString('en-IN')}</strong><small><span className="positive">↓ 3.2%</span> from your budget</small></div><div className="summary-card"><span>Budget remaining</span><strong>₹{optimizationResult.budgetRemaining.toLocaleString('en-IN')}</strong><small>of ₹{budget.toLocaleString('en-IN')} daily limit</small></div><div className="summary-card"><span>Nutrition coverage</span><strong>{optimizationResult.nutritionCoverage}<em>%</em></strong><small><span className="warning-text">Iron is at {optimizationResult.ironCoverage}%</span></small></div><div className="summary-card"><span>People served</span><strong>500</strong><small><span className="positive"><Check size={13} /> At kitchen capacity</span></small></div></section>

          <div className="content-grid"><section className="main-column">
            <div className="section-header"><div><h2>7-day meal plan</h2><p>Click any meal to see its cost and nutrition details.</p></div><button className="text-button" onClick={() => setIngredientsOpen(!ingredientsOpen)}>{ingredientsOpen ? 'Hide ingredients' : 'View ingredients'} <ArrowRight size={15} /></button></div>
            {ingredientsOpen && <div className="ingredients-panel"><div className="ingredients-title"><div><strong>Ingredient availability</strong><span>Sample dataset used for this plan</span></div><span className="pill success"><Check size={12} /> All available</span></div><div className="ingredient-list">{ingredients.map(([name, qty, unit, price]) => <div className="ingredient-row" key={name as string}><span>{name}</span><strong>{qty} {unit}</strong><span>{price}</span><span className="available"><span className="status-dot" /> Available</span></div>)}</div></div>}
            <div className="table-card"><table><thead><tr><th>DAY</th><th>BREAKFAST</th><th>LUNCH</th><th>DINNER</th></tr></thead><tbody>{plan.map((day) => <tr key={day[0]}><th>{day[0]}</th>{day.slice(1).map((meal) => <td key={meal}><button className="meal-button" onClick={() => setSelectedMeal(mealDetails[meal] || { name: meal, description: 'A balanced vegetarian meal from the sample plan.', cost: '₹30', protein: '14g', kcal: '560 kcal', tags: ['Vegetarian'] })}>{meal}<ChevronRight size={14} /></button></td>)}</tr>)}</tbody></table></div>

            <div className="lower-grid"><section className="panel"><div className="panel-heading"><div><h2>Nutrition coverage</h2><p>Daily average against selected targets</p></div><span className="sample-label">SAMPLE DATA</span></div><div className="nutrition-list"><div><div className="metric-label"><span>Energy</span><strong>92%</strong></div><ProgressBar value={92} /></div><div><div className="metric-label"><span>Protein</span><strong>98%</strong></div><ProgressBar value={98} /></div><div><div className="metric-label"><span>Iron <AlertTriangle size={14} className="warning-icon" /></span><strong className="warning-text">84%</strong></div><ProgressBar value={84} tone="amber" /></div><div><div className="metric-label"><span>Calcium</span><strong>91%</strong></div><ProgressBar value={91} /></div></div><div className="gap-callout"><AlertTriangle size={16} /><div><strong>Nutrition gap to watch</strong><p>Iron is below the selected target. Consider increasing legumes or leafy vegetables.</p></div><button aria-label="See nutrition gap"><ChevronRight size={16} /></button></div></section>
              <section className="panel constraints"><div className="panel-heading"><div><h2>Plan constraints</h2><p>All requirements checked</p></div><Check className="large-check" size={20} /></div>{['Budget · ₹17,420 of ₹18,000','Ingredients · 6 of 6 available','Kitchen capacity · 500 meals/day','Dietary requirement · Vegetarian','Meal variety · 7 unique days'].map((item) => <div className="constraint-row" key={item}><span className="check-circle"><Check size={12} /></span><span>{item}</span></div>)}</section></div>

            <section className="why-panel"><div className="why-icon"><Sparkles size={18} /></div><div><div className="section-kicker">OPTIMIZATION EXPLANATION</div><h2>Why this plan?</h2><p>The selected plan stays within the <strong>₹18,000 daily budget</strong> while maintaining your vegetarian and kitchen capacity requirements.</p><p>Lower-cost protein sources were used on selected days to preserve nutrition without exceeding the budget. All required ingredients are currently available.</p></div><button className="icon-button"><ChevronRight size={18} /></button></section>
          </section><aside className="right-column"><div className="side-card gap-card"><div className="side-kicker"><AlertTriangle size={14} /> NUTRITION GAP</div><h3>Iron needs attention</h3><div className="gap-number">84<span>%</span></div><p>Your current plan is slightly below the selected iron target.</p><div className="suggestion"><strong>Possible improvement</strong><span>Increase iron-rich legumes or leafy vegetables within the available budget.</span></div></div><div className="side-card"><div className="side-card-heading"><div><div className="side-kicker">QUICK ACTION</div><h3>Explore a trade-off</h3></div><RefreshCw size={17} /></div><p>See how the plan responds when your budget or ingredients change.</p><button className="dark-button" onClick={() => setWhatIfOpen(true)}>Open What-If planner <ArrowRight size={15} /></button></div><div className="demo-note"><CircleHelp size={15} /><span>These are prototype values for demonstration, not authoritative nutritional claims.</span></div></aside></div>
        </div>
      </main>

      {selectedMeal && <div className="modal-backdrop" onClick={() => setSelectedMeal(null)}><div className="meal-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelectedMeal(null)} aria-label="Close meal details"><X size={18} /></button><div className="meal-modal-kicker">MEAL DETAILS</div><h2>{selectedMeal.name}</h2><p>{selectedMeal.description}</p><div className="meal-stats"><div><span>Cost / person</span><strong>{selectedMeal.cost}</strong></div><div><span>Protein</span><strong>{selectedMeal.protein}</strong></div><div><span>Energy</span><strong>{selectedMeal.kcal}</strong></div></div><h4>Why it qualifies</h4><div className="tag-list">{selectedMeal.tags.map((tag) => <span className="pill success" key={tag}><Check size={12} /> {tag}</span>)}</div><button className="dark-button full" onClick={() => setSelectedMeal(null)}>Close details</button></div></div>}

      {whatIfOpen && <div className="modal-backdrop" onClick={() => setWhatIfOpen(false)}><div className="whatif-modal" onClick={(e) => e.stopPropagation()}><div className="modal-header"><div><div className="meal-modal-kicker">WHAT-IF PLANNER</div><h2>Explore a trade-off</h2><p>Adjust a constraint to see how the plan responds.</p></div><button className="modal-close" onClick={() => setWhatIfOpen(false)} aria-label="Close what-if planner"><X size={18} /></button></div><label className="range-label"><span>Daily budget</span><strong>₹{budget.toLocaleString('en-IN')}</strong></label><input className="budget-range" type="range" min="12000" max="18000" step="500" value={budget} onChange={(e) => { setBudget(Number(e.target.value)); setReoptimized(false) }} /><div className="range-endpoints"><span>₹12,000</span><span>₹18,000</span></div><div className="whatif-fields"><label>Ingredient availability<select><option>All ingredients available</option><option>Milk unavailable</option></select></label><label>People served<input value="500 people" readOnly /></label></div>{reoptimized ? <div className="updated-result"><div className="update-title"><span className="check-circle"><Check size={13} /></span><strong>Plan updated</strong></div><div className="comparison"><div><span>Before</span><strong>₹17,420</strong><small>92% nutrition</small></div><ArrowRight size={17} /><div><span>After</span><strong>₹{optimizationResult.dailyCost.toLocaleString('en-IN')}</strong><small>{optimizationResult.nutritionCoverage}% nutrition</small></div></div><p><strong>Change summary:</strong> {optimizationResult.changeSummary}</p></div> : <div className="whatif-preview"><strong>At ₹{budget.toLocaleString('en-IN')}, the optimizer may adjust higher-cost meals first.</strong><span>Nutrition and availability will be checked again.</span></div>}<button className="dark-button full" onClick={() => { setOptimizationResult(optimizePlan({ budget, ingredientsAvailable: true, mode: optimizerMode })); setReoptimized(true) }}><RefreshCw size={15} /> Re-optimize plan</button></div></div>}
    </div>
  )
}
