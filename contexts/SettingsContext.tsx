import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface Settings {
    showImportExport: boolean;
    allowDeletion: boolean;
    allowEditing: boolean;
}

interface SettingsContextType extends Settings {
    toggleShowImportExport: () => void;
    toggleAllowDeletion: () => void;
    toggleAllowEditing: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const getInitialSettings = (): Settings => {
    try {
        const item = window.localStorage.getItem('appSettings');
        if (item) {
            const parsed = JSON.parse(item);
            // تحقق أساسي لضمان عدم تعطل التطبيق إذا كان localStorage تالفًا
            return {
                showImportExport: typeof parsed.showImportExport === 'boolean' ? parsed.showImportExport : false,
                allowDeletion: typeof parsed.allowDeletion === 'boolean' ? parsed.allowDeletion : false,
                allowEditing: typeof parsed.allowEditing === 'boolean' ? parsed.allowEditing : false,
            };
        }
    } catch (error) {
        console.error('Error reading settings from localStorage', error);
    }
    // الإعدادات الافتراضية إذا لم يكن هناك شيء في localStorage أو في حالة وجود خطأ
    return {
        showImportExport: false,
        allowDeletion: false,
        allowEditing: false,
    };
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(getInitialSettings);

    useEffect(() => {
        try {
            window.localStorage.setItem('appSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings to localStorage', error);
        }
    }, [settings]);

    const toggleShowImportExport = () => {
        setSettings(prev => ({ ...prev, showImportExport: !prev.showImportExport }));
    };

    const toggleAllowDeletion = () => {
        setSettings(prev => ({ ...prev, allowDeletion: !prev.allowDeletion }));
    };

    const toggleAllowEditing = () => {
        setSettings(prev => ({ ...prev, allowEditing: !prev.allowEditing }));
    };

    const value = {
        ...settings,
        toggleShowImportExport,
        toggleAllowDeletion,
        toggleAllowEditing,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};