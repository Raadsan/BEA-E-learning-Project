"use client";

import { useEffect, useState } from "react";

type CountryStateCity = typeof import("country-state-city");

let modulePromise: Promise<CountryStateCity> | null = null;

function loadCountryModule() {
    if (!modulePromise) {
        modulePromise = import("country-state-city");
    }
    return modulePromise;
}

export async function getAllCountries() {
    const { Country } = await loadCountryModule();
    return Country.getAllCountries();
}

export async function getCitiesForCountryName(countryName: string) {
    if (!countryName) return [];
    const { Country, City } = await loadCountryModule();
    const country = Country.getAllCountries().find((c) => c.name === countryName);
    return country ? City.getCitiesOfCountry(country.isoCode) || [] : [];
}

export async function getCountryIsoCode(countryName: string) {
    if (!countryName) return "us";
    const countries = await getAllCountries();
    const country = countries.find((c) => c.name === countryName);
    return country ? country.isoCode.toLowerCase() : "us";
}

export function useCountryOptions() {
    const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        getAllCountries()
            .then((countries) => {
                if (cancelled) return;
                setOptions(countries.map((country) => ({
                    value: country.name,
                    label: country.name,
                })));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return { options, loading };
}

export function useCitiesForCountry(countryName: string) {
    const [cities, setCities] = useState<Array<{ name: string }>>([]);

    useEffect(() => {
        let cancelled = false;
        if (!countryName) {
            setCities([]);
            return;
        }
        getCitiesForCountryName(countryName).then((result) => {
            if (!cancelled) setCities(result);
        });
        return () => {
            cancelled = true;
        };
    }, [countryName]);

    return cities;
}

export function useCountryIsoCode(countryName: string) {
    const [isoCode, setIsoCode] = useState("us");

    useEffect(() => {
        let cancelled = false;
        getCountryIsoCode(countryName).then((code) => {
            if (!cancelled) setIsoCode(code);
        });
        return () => {
            cancelled = true;
        };
    }, [countryName]);

    return isoCode;
}
