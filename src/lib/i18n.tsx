import en from "@/locales/en.json";
import React, { createContext, useContext } from "react";

export type Locale = "en";

export const translations: Record<Locale, unknown> = {
	en,
};

export const getTranslation = (path: string, locale: Locale = "en"): string => {
	const keys = path.split(".");
	let current: unknown = translations[locale];
	for (const key of keys) {
		if (
			typeof current !== "object" ||
			current === null ||
			!(key in current)
		) {
			return path;
		}
		current = (current as Record<string, unknown>)[key];
	}
	return typeof current === "string" ? current : path;
};

type TranslationParams = Record<string, string | number>;
export type TFunction = (key: string, params?: TranslationParams) => string;

interface I18nContextType {
	locale: Locale;
	t: (key: string, params?: TranslationParams) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const locale: Locale = "en";
	const t = (key: string, params?: TranslationParams) => {
		const template = getTranslation(key, locale);
		if (!params) return template;
		return template.replace(/\{(\w+)\}/g, (match, token) =>
			token in params ? String(params[token]) : match,
		);
	};

	return (
		<I18nContext.Provider value={{ locale, t }}>
			{children}
		</I18nContext.Provider>
	);
};

export const useTranslation = () => {
	const context = useContext(I18nContext);
	if (!context) {
		throw new Error("useTranslation must be used within an I18nProvider");
	}
	return context;
};
