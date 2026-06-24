"use client";

import { useState } from "react";
import {
  AdminPermissionKey,
  AdminPermissionMap,
  PERMISSION_ACTIONS,
  PERMISSION_MODULE_PAGES,
  PermissionAction,
  TECHNICAL_ADMIN_PERMISSION_OPTIONS,
  initModuleSubPages,
  setModuleAction,
  setPageAction,
} from "@/constants/adminPermissions";

type PermissionMatrixProps = {
  permissionMap: AdminPermissionMap;
  onChange: (map: AdminPermissionMap) => void;
  isDark?: boolean;
};

export default function PermissionMatrix({
  permissionMap,
  onChange,
  isDark = false,
}: PermissionMatrixProps) {
  const [openModules, setOpenModules] = useState<Set<AdminPermissionKey>>(new Set(["dashboard"]));

  const handleModuleToggle = (moduleKey: AdminPermissionKey, action: PermissionAction, enabled: boolean) => {
    onChange(setModuleAction(permissionMap, moduleKey, action, enabled));
  };

  const handlePageToggle = (
    moduleKey: AdminPermissionKey,
    pageKey: string,
    action: PermissionAction,
    enabled: boolean
  ) => {
    onChange(setPageAction(permissionMap, moduleKey, pageKey, action, enabled));
  };

  const toggleModuleOpen = (moduleKey: AdminPermissionKey) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleKey)) next.delete(moduleKey);
      else next.add(moduleKey);
      return next;
    });
  };

  const handleModuleQuickToggle = (moduleKey: AdminPermissionKey, enabled: boolean) => {
    onChange(initModuleSubPages(permissionMap, moduleKey, enabled));
    if (enabled) {
      setOpenModules((prev) => new Set(prev).add(moduleKey));
    }
  };

  const renderActionCheckboxes = (
    moduleKey: AdminPermissionKey,
    pageKey: string | null,
    isEnabled: boolean,
    actions: { view?: boolean; add?: boolean; edit?: boolean; delete?: boolean } | undefined
  ) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {PERMISSION_ACTIONS.map((action) => (
        <label
          key={action.key}
          className={`flex items-center gap-2 text-sm rounded-lg px-2 py-2 cursor-pointer ${
            isDark ? "hover:bg-gray-700" : "hover:bg-blue-50"
          }`}
        >
          <input
            type="checkbox"
            checked={action.key === "view" ? isEnabled : actions?.[action.key] === true}
            onChange={(e) =>
              pageKey
                ? handlePageToggle(moduleKey, pageKey, action.key, e.target.checked)
                : handleModuleToggle(moduleKey, action.key, e.target.checked)
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className={isDark ? "text-gray-200" : "text-gray-700"}>{action.label}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="space-y-2">
      {TECHNICAL_ADMIN_PERMISSION_OPTIONS.map((module) => {
        const mod = permissionMap[module.key];
        const subPages = PERMISSION_MODULE_PAGES[module.key];
        const isEnabled = mod?.view === true;
        const isOpen = openModules.has(module.key);

        return (
          <div
            key={module.key}
            className={`rounded-xl border overflow-hidden ${
              isDark ? "border-gray-600 bg-gray-800/40" : "border-gray-200 bg-white"
            }`}
          >
            <div
              className={`flex items-center justify-between px-4 py-3 ${
                isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => handleModuleQuickToggle(module.key, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                />
                <button
                  type="button"
                  onClick={() => toggleModuleOpen(module.key)}
                  className={`font-semibold text-sm text-left truncate ${
                    isDark ? "text-white" : "text-gray-800"
                  }`}
                >
                  {module.label}
                </button>
              </div>
              <button
                type="button"
                onClick={() => toggleModuleOpen(module.key)}
                className={`p-1 rounded-lg shrink-0 ${isDark ? "hover:bg-gray-600" : "hover:bg-gray-100"}`}
                aria-expanded={isOpen}
              >
                <svg
                  className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""} ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {isOpen && (
              <div
                className={`px-4 pb-4 pt-2 border-t space-y-3 ${
                  isDark ? "border-gray-700 bg-gray-900/20" : "border-gray-100 bg-gray-50/60"
                }`}
              >
                {subPages?.length ? (
                  <>
                    <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      Choose access for each page under {module.label}.
                    </p>
                    {subPages.map((page) => {
                      const pageMod = mod?.pages?.[page.key];
                      const pageEnabled = pageMod?.view === true;

                      return (
                        <div
                          key={page.key}
                          className={`rounded-lg border p-3 ${
                            isDark ? "border-gray-600 bg-gray-800/50" : "border-gray-200 bg-white"
                          }`}
                        >
                          <p className={`text-sm font-medium mb-2 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
                            {page.label}
                          </p>
                          {renderActionCheckboxes(module.key, page.key, pageEnabled, pageMod)}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {renderActionCheckboxes(module.key, null, isEnabled, mod)}
                    <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      View shows this section in the sidebar. Uncheck Delete to hide delete buttons.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
