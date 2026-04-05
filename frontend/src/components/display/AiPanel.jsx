function AiPanel({ aiResult, loadingAI }) {
  return (
    <div className="ai-panel">
      <div className="ai-card">
        <div className="ai-header">AI Evaluation</div>
        <div className="ai-body">
          {loadingAI && (
            <div className="ai-loading">
              <div className="spinner" /> Analyzing timetable...
            </div>
          )}
          {!loadingAI && aiResult && (
            <pre className="ai-output">
              {aiResult.raw_output ? aiResult.raw_output : JSON.stringify(aiResult, null, 2)}
            </pre>
          )}
          {!loadingAI && !aiResult && (
            <p className="ai-placeholder">AI analysis will appear here after generation.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AiPanel;
