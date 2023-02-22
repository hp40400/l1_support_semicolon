const clarificationModel = require('../models/clarificationModel')

exports.getAllClarificationList = async (req, res) => {
  const mockData = [
    {
      id: '1',
      title: 'L1',
      clarification: [
        { request: '', response: '', timestamp: '' },
        { request: '', response: '', timestamp: '' },
      ],
      feedback: {
        is_satisfied: '',
        reason: '',
      },
    },
    {
      id: '2',
      title: 'L2',
      clarification: [{ request: '', response: '', timestamp: '' }],
      feedback: {
        is_satisfied: '',
        reason: '',
      },
    },
  ]

  res.status(200).json({
    status: 'success',
    result: mockData.length,
    data: {
      mockData,
    },
  })
}
