import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientGaitAnalysis.css';
import backIcon from '../Assets/left.png';

interface GaitMetric {
  id: number;
  name: string;
  patientValue: number; // 0-100 (example)
  minValue: number;
  maxValue: number;
}

const initialGaitMetrics: GaitMetric[] = [
  { id: 1, name: 'Velocity',                    patientValue: 40, minValue: 0,  maxValue: 100 },
  { id: 2, name: 'Cadence',                     patientValue: 60, minValue: 0,  maxValue: 100 },
  { id: 3, name: 'Stride length',               patientValue: 75, minValue: 0,  maxValue: 100 },
  { id: 4, name: 'Ground reaction force',       patientValue: 50, minValue: 0,  maxValue: 100 },
  { id: 5, name: 'Center of pressure',          patientValue: 30, minValue: 0,  maxValue: 100 },
  { id: 6, name: 'Lateral center of mass',      patientValue: 20, minValue: 0,  maxValue: 100 },
  { id: 7, name: 'Extrapolated center of mass', patientValue: 90, minValue: 0,  maxValue: 100 },
  { id: 8, name: 'Margin of stability',         patientValue: 45, minValue: 0,  maxValue: 100 },
  { id: 9, name: 'Balance',                     patientValue: 80, minValue: 0,  maxValue: 100 },
];

const PatientGaitAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'data' | 'therapy'>('data');
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  const handleShowEvolution = (metricName: string) => {
    alert(`Show evolution for: ${metricName}`);
  };

  return (
    <div className="pga__container">
      {/* Header / Navbar */}
      <div className="pga__header">
        <button className="pga__back-button" onClick={handleBack}>
          <img src={backIcon} alt="Back" className="pga__back-icon" />
          Back
        </button>
        <h1 className="pga__title">Patient Gait Analysis</h1>
        <button className="pga__patient-btn">Patient no.</button>
      </div>

      {/* New container for Tabs and Main Content */}
      <div className="pga__content-container">
        {/* Tabs */}
        <div className="pga__tabs">
          <button
            className={`pga__tab-btn ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data Visualisation
          </button>
          <button
            className={`pga__tab-btn ${activeTab === 'therapy' ? 'active' : ''}`}
            onClick={() => setActiveTab('therapy')}
          >
            Therapy Suggestions
          </button>
        </div>

        {/* Main content area */}
        {activeTab === 'data' && (
          <div className="pga__data-panel">
            {/* Panel header: "Gait Data" + "Today" dropdown */}
            <div className="pga__data-header">
              <h2>Gait Data</h2>
            </div>

            {/* Metrics list */}
            <div className="pga__metrics">
              {initialGaitMetrics.map((metric) => (
                <div key={metric.id} className="pga__metric-row">
                  {/* Left label */}
                  <div className="pga__metric-name">{metric.name}</div>

                  {/* Colored bar */}
                  <div className="pga__bar-wrapper">
                    <div className="pga__bar-bg">
                      <div
                        className="pga__bar-marker"
                        style={{ left: `${metric.patientValue}%` }}
                      >
                        <div className="pga__bar-marker-circle"></div>
                        <div className="pga__bar-marker-tooltip">
                          {metric.patientValue}% 
                        </div>
                      </div>
                      <div className="pga__bar-labels">
                        <span className="pga__min-value">Min Value</span>
                        <span className="pga__max-value">Max Value</span>
                      </div>
                    </div>
                  </div>

                  {/* Show Evolution button */}
                  <button
                    className="pga__show-evolution"
                    onClick={() => handleShowEvolution(metric.name)}
                  >
                    Show Evolution 
                  </button>
                </div>
              ))}
            </div>

            {/* Bottom button */}
            <button className="pga__analyze-btn">
              Analyze &amp; Suggest Therapy
            </button>
          </div>
        )}

        {activeTab === 'therapy' && (
          <div className="pga__therapy-panel">
            <div className="pga__data-header">
              <h2>Therapy Suggestions</h2>
            </div>
            <p>Here you can list therapy suggestions…</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientGaitAnalysis;
