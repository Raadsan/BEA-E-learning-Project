import Select from 'react-select';
import { Country } from 'country-state-city';

export default function CountrySelect({ value, onChange, isDark = false, placeholder = "Select country" }) {
    const countries = Country.getAllCountries();

    const options = countries.map(country => ({
        value: country.name,
        label: country.name,
        flag: country.flag,
        isoCode: country.isoCode
    }));

    const selectedOption = options.find(opt => opt.value === value) || null;

    // Custom format to show only country name (no flags or codes)
    const formatOptionLabel = (option, { context }) => {
        // Show only country name in both dropdown and selected value
        return option.label;
    };

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            minHeight: '48px',
            borderRadius: '0.5rem',
            border: state.isFocused
                ? isDark ? '2px solid #60a5fa' : '2px solid #93c5fd'
                : isDark ? '1px solid #4b5563' : '1px solid #d1d5db',
            boxShadow: 'none',
            '&:hover': {
                border: state.isFocused
                    ? isDark ? '2px solid #60a5fa' : '2px solid #93c5fd'
                    : isDark ? '1px solid #4b5563' : '1px solid #d1d5db'
            },
            backgroundColor: isDark ? '#374151' : 'white',
            cursor: 'pointer'
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '0.5rem',
            marginTop: '4px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 9999,
            backgroundColor: isDark ? '#374151' : 'white',
            border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb'
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '250px',
            padding: '4px'
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? isDark ? '#1e40af' : '#dbeafe'
                : state.isFocused
                    ? isDark ? '#4b5563' : '#f3f4f6'
                    : isDark ? '#374151' : 'white',
            color: isDark ? '#f3f4f6' : '#1f2937',
            cursor: 'pointer',
            padding: '10px 12px',
            fontSize: '15px',
            '&:active': {
                backgroundColor: isDark ? '#1e40af' : '#dbeafe'
            }
        }),
        input: (provided) => ({
            ...provided,
            margin: '0',
            padding: '0',
            color: isDark ? '#f3f4f6' : '#1f2937'
        }),
        placeholder: (provided) => ({
            ...provided,
            color: isDark ? '#9ca3af' : '#9ca3af',
            fontSize: '15px'
        }),
        singleValue: (provided) => ({
            ...provided,
            color: isDark ? '#f3f4f6' : '#1f2937',
            fontSize: '15px'
        })
    };

    return (
        <Select
            options={options}
            value={selectedOption}
            onChange={(option) => onChange(option ? option.value : '')}
            styles={customStyles}
            formatOptionLabel={formatOptionLabel}
            placeholder={placeholder}
            isSearchable={true}
            isClearable={false}
            className="country-select"
        />
    );
}
