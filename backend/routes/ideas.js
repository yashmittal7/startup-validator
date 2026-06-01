const express = require('express');
const router = express.Router();
const Idea = require('../models/Idea');
const authMiddleware = require('../middleware/auth');

// This function generates a realistic analysis without any AI API
function generateAnalysis(startupName, industry, description) {
  const industryData = {
    EdTech: {
      competitors: ['Coursera', 'Udemy', 'Khan Academy'],
      opportunities: ['Growing demand for online learning', 'Corporate training market expanding', 'AI-personalized learning paths'],
      threats: ['Big tech entering education space', 'Low willingness to pay for content', 'High content creation costs'],
      revenueModel: 'Freemium model with premium courses, monthly subscription plans, and B2B corporate licensing deals.',
    },
    FinTech: {
      competitors: ['Razorpay', 'Paytm', 'PhonePe'],
      opportunities: ['Underbanked population in emerging markets', 'UPI and open banking growth', 'Rising digital payment adoption'],
      threats: ['Heavy regulatory compliance requirements', 'Established bank competition', 'Cybersecurity risks'],
      revenueModel: 'Transaction fees, premium account subscriptions, lending interest margins, and API access fees for businesses.',
    },
    Healthcare: {
      competitors: ['Practo', 'DocsApp', '1mg'],
      opportunities: ['Post-pandemic health awareness boom', 'Telemedicine adoption surge', 'Aging global population'],
      threats: ['Strict healthcare regulations', 'Data privacy laws (HIPAA)', 'High customer acquisition costs'],
      revenueModel: 'Consultation fees, medicine delivery margins, insurance partnerships, and premium wellness subscriptions.',
    },
    AI: {
      competitors: ['OpenAI', 'Anthropic', 'Google DeepMind'],
      opportunities: ['Enterprise automation demand', 'Cost reduction pressure on businesses', 'Massive untapped SME market'],
      threats: ['Rapid technology obsolescence', 'High compute costs', 'Talent acquisition difficulty'],
      revenueModel: 'API usage-based pricing, enterprise SaaS licenses, custom model training contracts, and consulting services.',
    },
    'E-Commerce': {
      competitors: ['Amazon', 'Flipkart', 'Meesho'],
      opportunities: ['Tier 2 and Tier 3 city growth', 'Social commerce rise', 'Quick commerce trend'],
      threats: ['Razor-thin margins', 'Logistics complexity', 'High return rates'],
      revenueModel: 'Product margins, seller commissions, advertising fees, and premium seller subscription plans.',
    },
    SaaS: {
      competitors: ['Salesforce', 'HubSpot', 'Zoho'],
      opportunities: ['Digital transformation of SMEs', 'Remote work tool demand', 'Global market reach from day one'],
      threats: ['High churn rate risk', 'Feature parity with big players', 'Long sales cycles for enterprise'],
      revenueModel: 'Monthly and annual subscription tiers, per-seat pricing, enterprise custom contracts, and add-on feature fees.',
    },
    Other: {
      competitors: ['Existing market leaders', 'Local established players', 'International entrants'],
      opportunities: ['Underserved niche market', 'Technology-driven disruption possible', 'First-mover advantage available'],
      threats: ['Market education required', 'Undefined regulatory landscape', 'Investor unfamiliarity with space'],
      revenueModel: 'Direct sales, subscription model, marketplace commissions, and strategic partnership revenue sharing.',
    },
  };

  const data = industryData[industry] || industryData['Other'];

  // Generate scores based on description length and keywords
  const descWords = description.toLowerCase();
  let marketScore = 6;
  let successProbability = 55;

  if (descWords.includes('unique') || descWords.includes('innovative')) { marketScore += 1; successProbability += 5; }
  if (descWords.includes('problem') || descWords.includes('solution')) { marketScore += 1; successProbability += 5; }
  if (descWords.includes('market') || descWords.includes('customer')) { successProbability += 5; }
  if (description.length > 200) { marketScore += 1; successProbability += 5; }
  if (marketScore > 9) marketScore = 9;
  if (successProbability > 85) successProbability = 85;

  return {
    executiveSummary: `${startupName} is an emerging ${industry} startup that aims to address a real gap in the market. The concept shows potential for scalability and addresses a genuine user need. With the right execution and go-to-market strategy, ${startupName} can carve out a meaningful position in the ${industry} space.`,

    problemSolved: `${startupName} tackles the core inefficiencies and pain points currently faced by users in the ${industry} sector. Based on the description provided, the startup addresses friction in existing solutions and offers a more streamlined, accessible, or cost-effective alternative that the target market currently lacks.`,

    targetAudience: `The primary audience for ${startupName} includes early adopters in the ${industry} space, typically aged 18–45, who are comfortable with technology and actively seeking better solutions. Secondary audiences include businesses and organizations operating in the ${industry} vertical who can benefit from adopting this solution at scale.`,

    competitors: data.competitors,

    strengths: [
      `Clear focus on the ${industry} vertical with domain-specific features`,
      `Addresses a real and validated pain point in the market`,
      `Lean startup approach allows faster iteration and product improvements`,
    ],

    weaknesses: [
      'Early-stage product with limited brand recognition and trust',
      'Requires significant user education and onboarding investment',
      'Limited funding runway may constrain growth speed',
    ],

    opportunities: data.opportunities,
    threats: data.threats,
    revenueModel: data.revenueModel,

    mvpFeatures: [
      'User registration, login, and onboarding flow',
      `Core ${industry} feature that delivers the primary value proposition`,
      'Basic dashboard with usage analytics and progress tracking',
      'Mobile-responsive design for accessibility across devices',
    ],

    risks: [
      'Low initial user adoption if marketing strategy is not well executed',
      'Technical scalability challenges as the user base grows rapidly',
      'Potential regulatory or compliance issues specific to the industry',
    ],

    marketScore,
    successProbability,
  };
}

// POST /api/ideas
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { startupName, description, industry } = req.body;

    if (!startupName || !description || !industry) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const analysis = generateAnalysis(startupName, industry, description);

    const idea = new Idea({
      userId: req.user.id,
      startupName,
      description,
      industry,
      analysis,
    });

    await idea.save();
    res.status(201).json(idea);

  } catch (err) {
    console.error('Error creating idea:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// GET /api/ideas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const ideas = await Idea.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/ideas/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    if (idea.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    res.json(idea);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/ideas/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    if (idea.userId.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    await idea.deleteOne();
    res.json({ message: 'Idea deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;