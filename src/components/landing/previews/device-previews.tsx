import type { LandingPlanData } from "../plan-facts";
import { DashboardScreen } from "../mockups/dashboard-screen";
import { PlannerScreen } from "../mockups/planner-screen";
import { DayWorkspaceScreen } from "../mockups/day-workspace-screen";
import type { LandingDeviceKind } from "./types";

export type LandingDevicePreviewProps = {
  device: LandingDeviceKind;
  plan: LandingPlanData;
};

/** The actual static product mockups, recomposed at three device widths. */
export function DevicePreview({ device, plan }: LandingDevicePreviewProps) {
  return (
    <div className="@container h-full overflow-hidden bg-background text-[8px] text-foreground" data-device={device}>
      {device === "phone" ? <DayWorkspaceScreen plan={plan} /> : null}
      {device === "tablet" ? <PlannerScreen plan={plan} /> : null}
      {device === "laptop" ? <DashboardScreen /> : null}
    </div>
  );
}

export function PhonePreview({ plan }: { plan: LandingPlanData }) {
  return <DevicePreview device="phone" plan={plan} />;
}

export function TabletPreview({ plan }: { plan: LandingPlanData }) {
  return <DevicePreview device="tablet" plan={plan} />;
}

export function LaptopPreview({ plan }: { plan: LandingPlanData }) {
  return <DevicePreview device="laptop" plan={plan} />;
}
