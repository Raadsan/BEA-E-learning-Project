"use client";

import { useMemo } from "react";
import {
    buildCurriculumSequence,
    buildSubprogramProgress,
    formatPillarLabel,
    isLevelClickable,
    SubprogramLevelProgress,
    UnitState,
} from "@/utils/subprogramProgress";

interface SubprogramCurriculumMapProps {
    subprograms: Array<{ id: number | string; subprogram_name?: string; name?: string }>;
    user?: {
        chosen_subprogram?: string | number | null;
        completed_subprograms?: unknown;
    } | null;
    studentClass?: { subprogram_id?: number | string | null; class_name?: string | null } | null;
    onSelect?: (subprogram: { id: number | string; subprogram_name?: string }, progress: SubprogramLevelProgress) => void;
    onDownloadCertificate?: (subprogram: { id: number | string; subprogram_name?: string }) => void;
    showCertificateButton?: boolean;
}

const WITHIN_GROUP_GAP = 10;
const BETWEEN_GROUP_GAP = 3;

function getPillarWidth(totalPillars: number, isIntegrated: boolean): number {
    const base = totalPillars <= 8 ? 68 : totalPillars >= 12 ? 46 : 54;
    return isIntegrated ? Math.max(base - 6, 38) : base;
}

function UnitHeader({
    showAB,
    unitA,
    unitB,
    isCurrentLevel,
}: {
    showAB: boolean;
    unitA: UnitState;
    unitB: UnitState;
    isCurrentLevel: boolean;
}) {
    if (!showAB) {
        return null;
    }

    const unitClass = (state: UnitState) => {
        if (!isCurrentLevel) return "bg-gray-500 text-white";
        if (state === "active" || state === "completed") return "bg-[#010080] text-white";
        return "bg-gray-500 text-white";
    };

    return (
        <div className="flex w-full h-9 flex-shrink-0 overflow-hidden rounded-t-[18px]">
            <div className={`flex-1 flex items-center justify-center text-[10px] font-bold border-r border-white/25 ${unitClass(unitA)}`}>
                A
            </div>
            <div className={`flex-1 flex items-center justify-center text-[10px] font-bold ${unitClass(unitB)}`}>
                B
            </div>
        </div>
    );
}

function PillarCard({
    progress,
    pillarWidth,
    onClick,
    onDownloadCertificate,
    showCertificateButton,
}: {
    progress: SubprogramLevelProgress;
    pillarWidth: number;
    onClick: () => void;
    onDownloadCertificate?: () => void;
    showCertificateButton?: boolean;
}) {
    const clickable = isLevelClickable(progress);
    const isCurrentLevel = progress.access === "active";
    const displayLabel = formatPillarLabel(progress.subprogramName);
    const isIntegrated = !progress.showAB;
    const labelSize = isIntegrated ? "text-[7.5px]" : "text-[10.5px]";

    return (
        <div
            className={`flex flex-col items-center h-full flex-shrink-0 ${clickable ? "cursor-pointer" : "cursor-default"}`}
            style={{ width: pillarWidth }}
        >
            <button
                type="button"
                onClick={onClick}
                disabled={!clickable}
                className="group relative w-full flex-1 min-h-0 transition-transform duration-200 hover:scale-[1.01]"
                title={progress.subprogramName}
            >
                <div
                    className={`rounded-[18px] overflow-hidden shadow-sm flex flex-col h-full ${
                        isCurrentLevel ? "bg-[#010080]" : "bg-gray-500"
                    } ${!progress.showAB ? "pt-1" : ""}`}
                >
                    <UnitHeader
                        showAB={progress.showAB}
                        unitA={progress.unitA}
                        unitB={progress.unitB}
                        isCurrentLevel={isCurrentLevel}
                    />

                    <div className="flex-1 flex items-center justify-center px-0.5 py-2 min-h-0">
                        <span
                            className={`${labelSize} font-semibold uppercase tracking-[0.04em] -rotate-90 whitespace-nowrap text-white leading-none`}
                        >
                            {displayLabel}
                        </span>
                    </div>
                </div>
            </button>

            {progress.stepNumber ? (
                <div
                    className={`mt-2 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white ${
                        isCurrentLevel ? "bg-[#010080]" : "bg-gray-500"
                    }`}
                >
                    {progress.stepNumber}
                </div>
            ) : (
                <div className="mt-2 h-8 flex-shrink-0" />
            )}

            {showCertificateButton && progress.isFullyCompleted && !isCurrentLevel && onDownloadCertificate && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDownloadCertificate();
                    }}
                    className="mt-1 flex-shrink-0 p-0.5 rounded-full bg-green-500 text-white shadow hover:scale-110 transition-transform"
                    title="Download certificate"
                >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
            )}
        </div>
    );
}

type LevelGroup = {
    label?: string;
    items: SubprogramLevelProgress[];
};

function buildLevelGroups(progressList: SubprogramLevelProgress[]): LevelGroup[] {
    const groups: LevelGroup[] = [];
    let current: LevelGroup | null = null;

    progressList.forEach((item) => {
        const bandLabel = item.cefrBand;

        if (!bandLabel) {
            if (current) {
                groups.push(current);
                current = null;
            }
            groups.push({ label: undefined, items: [item] });
            return;
        }

        if (current && current.label === bandLabel) {
            current.items.push(item);
            return;
        }

        if (current) groups.push(current);
        current = { label: bandLabel, items: [item] };
    });

    if (current) groups.push(current);
    return groups;
}

function LevelGroupBlock({
    group,
    orderedSubprograms,
    totalPillars,
    onSelect,
    onDownloadCertificate,
    showCertificateButton,
}: {
    group: LevelGroup;
    orderedSubprograms: Array<{ id: number | string; subprogram_name?: string; name?: string }>;
    totalPillars: number;
    onSelect?: SubprogramCurriculumMapProps["onSelect"];
    onDownloadCertificate?: SubprogramCurriculumMapProps["onDownloadCertificate"];
    showCertificateButton?: boolean;
}) {
    const isActiveGroup = group.items.some((item) => item.access === "active");

    return (
        <div
            className="flex flex-col h-full items-center flex-1 min-w-0"
            style={{ flex: group.items.length }}
        >
            <div className="flex flex-1 items-stretch min-h-0 w-full justify-center" style={{ gap: WITHIN_GROUP_GAP }}>
                {group.items.map((progress) => {
                    const subprogram = orderedSubprograms[progress.index];
                    const pillarWidth = getPillarWidth(totalPillars, !progress.showAB);
                    return (
                        <PillarCard
                            key={progress.subprogramId}
                            progress={progress}
                            pillarWidth={pillarWidth}
                            onClick={() => {
                                if (isLevelClickable(progress) && onSelect && subprogram) {
                                    onSelect(subprogram, progress);
                                }
                            }}
                            showCertificateButton={showCertificateButton}
                            onDownloadCertificate={
                                onDownloadCertificate
                                    ? () => onDownloadCertificate(subprogram)
                                    : undefined
                            }
                        />
                    );
                })}
            </div>

            {group.label ? (
                <div
                    className={`mt-3 flex-shrink-0 h-9 w-full rounded-full flex items-center justify-center text-[11px] font-bold text-white whitespace-nowrap px-3 ${
                        isActiveGroup ? "bg-[#010080]" : "bg-gray-500"
                    }`}
                >
                    {group.label}
                </div>
            ) : (
                <div className="mt-3 h-9 flex-shrink-0" />
            )}
        </div>
    );
}

export default function SubprogramCurriculumMap({
    subprograms,
    user,
    studentClass,
    onSelect,
    onDownloadCertificate,
    showCertificateButton = false,
}: SubprogramCurriculumMapProps) {
    const orderedSubprograms = useMemo(() => buildCurriculumSequence(subprograms), [subprograms]);

    const progressList = useMemo(
        () =>
            buildSubprogramProgress({
                subprograms,
                user,
                studentClass,
                curriculumSequence: orderedSubprograms,
            }),
        [subprograms, orderedSubprograms, user, studentClass]
    );

    const levelGroups = useMemo(() => buildLevelGroups(progressList), [progressList]);

    return (
        <div className="w-full h-full flex flex-col min-h-0">
            <div
                className="w-full h-full flex items-stretch justify-between min-h-0"
                style={{ gap: BETWEEN_GROUP_GAP }}
            >
                {levelGroups.map((group, index) => (
                    <LevelGroupBlock
                        key={`${group.label || "single"}-${index}`}
                        group={group}
                        orderedSubprograms={orderedSubprograms}
                        totalPillars={progressList.length}
                        onSelect={onSelect}
                        onDownloadCertificate={onDownloadCertificate}
                        showCertificateButton={showCertificateButton}
                    />
                ))}
            </div>
        </div>
    );
}
