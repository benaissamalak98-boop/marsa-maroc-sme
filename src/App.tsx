import React, { useState } from 'react';
import { TopHeader } from './components/layout/TopHeader';
import { ModuleNavigation } from './components/layout/ModuleNavigation';
import { PortAgadirDigitalTwin } from './components/scada/PortAgadirDigitalTwin';
import { ElectricalFlowSynoptic } from './components/scada/ElectricalFlowSynoptic';
import { SubstationInspector } from './components/scada/SubstationInspector';
import { ModuleSelectorGrid } from './components/modules/ModuleSelectorGrid';
import { ModuleDetailView } from './components/modules/ModuleDetailView';
import { AlertTicker } from './components/common/AlertTicker';
import { IndustrialFooter } from './components/layout/IndustrialFooter';
import { SUBSTATIONS_DATA, PORT_ZONES } from './data/portTopology';
import { MODULES_CONFIG } from './data/modulesConfig';
import type { SubstationNode, PortZone } from './types/energy';

export const App: React.FC = () => {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [selectedSubstation, setSelectedSubstation] = useState<SubstationNode>(SUBSTATIONS_DATA[1]); // PP-DEPA default
  const [selectedZone, setSelectedZone] = useState<PortZone | null>(PORT_ZONES[0]);

  const activeModule = MODULES_CONFIG.find(m => m.id === activeModuleId);

  const handleSelectModule = (id: string | null) => {
    setActiveModuleId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-deep-950 text-slate-100 flex flex-col font-sans bg-mesh-dark">
      {/* 1. Header with Marsa Maroc Official Logo & DEPA Signature */}
      <TopHeader 
        activeModuleId={activeModuleId}
        onNavigateHome={() => handleSelectModule(null)}
        onSelectModule={handleSelectModule}
      />

      {/* 2. Scalable Navigation Bar for the 6 Modules */}
      <ModuleNavigation 
        activeModuleId={activeModuleId}
        onSelectModule={handleSelectModule}
      />

      {/* 3. Main Operational Content Area */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 lg:px-6 py-6 flex flex-col gap-6">
        
        {/* Real-time Alert Banner */}
        <AlertTicker />

        {/* Dynamic View: Home Command Center VS Specialized Module */}
        {activeModuleId === null ? (
          <div className="flex flex-col gap-8">
            
            {/* Top SCADA Section: Digital Twin + Live Substation Inspector */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
              {/* Digital Twin SCADA Map (Takes 2 cols on xl) */}
              <div className="xl:col-span-2">
                <PortAgadirDigitalTwin 
                  selectedSubstation={selectedSubstation}
                  onSelectSubstation={setSelectedSubstation}
                  selectedZone={selectedZone}
                  onSelectZone={setSelectedZone}
                />
              </div>

              {/* Substation Deep Inspector (Takes 1 col on xl) */}
              <div className="xl:col-span-1">
                <SubstationInspector 
                  substation={selectedSubstation}
                  onOpenModule={handleSelectModule}
                />
              </div>
            </div>

            {/* Electrical Power Flow Synoptic (Schéma unifilaire HTA/BT) */}
            <div>
              <ElectricalFlowSynoptic 
                onSelectSubstation={setSelectedSubstation}
                selectedSubstationId={selectedSubstation.id}
              />
            </div>

            {/* 6 Specialized Modules Exploration Grid */}
            <div className="pt-2">
              <ModuleSelectorGrid onSelectModule={handleSelectModule} />
            </div>

          </div>
        ) : (
          /* Specialized Module Detail View */
          activeModule && (
            <ModuleDetailView 
              module={activeModule}
              onBack={() => handleSelectModule(null)}
            />
          )
        )}

      </main>

      {/* 4. Industrial Footer */}
      <IndustrialFooter />
    </div>
  );
};

export default App;
