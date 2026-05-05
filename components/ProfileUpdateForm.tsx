"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type UserRecord = Record<string, unknown>;

type ProfileFormState = {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: "male" | "female" | "other" | "";
};

type ProfileFormErrors = Partial<Record<keyof ProfileFormState, string>>;

const getValue = (obj: UserRecord, ...keys: string[]) => {
    for (const key of keys) {
        const value = obj[key];
        if (typeof value === "string") return value;
    }
    return "";
};

const normalizeDate = (value: string) => {
    if (!value) return "";
    return value.includes("T") ? value.split("T")[0] : value;
};

const getInitialValues = (user: UserRecord): ProfileFormState => ({
    firstName: getValue(user, "firstName", "first_name", "firstname", "givenName"),
    lastName: getValue(user, "lastName", "last_name", "lastname", "familyName"),
    email: getValue(user, "email"),
    phoneNumber: getValue(user, "phoneNumber", "phone", "mobile"),
    dateOfBirth: normalizeDate(getValue(user, "dateOfBirth", "dob")),
    gender: (getValue(user, "gender") as ProfileFormState["gender"]) || "",
});

const nameRegex = /^[A-Za-z ]{2,40}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const normalizePhoneDigits = (value: string) => value.replaceAll(/\D/g, "");

const isValidPhoneNumber = (value: string) => {
    const digits = normalizePhoneDigits(value);

    // Accept 10-digit local number or +91 prefixed variant.
    if (digits.length === 10) return true;
    if (digits.length === 12 && digits.startsWith("91")) return true;
    return false;
};

const isValidAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return false;

    const dob = new Date(dateOfBirth);
    if (Number.isNaN(dob.getTime())) return false;

    const today = new Date();
    if (dob > today) return false;

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age -= 1;
    }

    return age >= 13 && age <= 120;
};

const validateProfileForm = (values: ProfileFormState): ProfileFormErrors => {
    const errors: ProfileFormErrors = {};

    if (!values.firstName.trim()) {
        errors.firstName = "First name is required.";
    } else if (!nameRegex.test(values.firstName.trim())) {
        errors.firstName = "First name must be 2-40 letters.";
    }

    if (!values.lastName.trim()) {
        errors.lastName = "Last name is required.";
    } else if (!nameRegex.test(values.lastName.trim())) {
        errors.lastName = "Last name must be 2-40 letters.";
    }

    if (!values.email.trim()) {
        errors.email = "Email is required.";
    } else if (!emailRegex.test(values.email.trim())) {
        errors.email = "Enter a valid email address.";
    }

    if (!values.phoneNumber.trim()) {
        errors.phoneNumber = "Phone number is required.";
    } else if (!isValidPhoneNumber(values.phoneNumber.trim())) {
        errors.phoneNumber = "Enter a valid phone number.";
    }

    if (!values.dateOfBirth) {
        errors.dateOfBirth = "Date of birth is required.";
    } else if (!isValidAge(values.dateOfBirth)) {
        errors.dateOfBirth = "Age must be between 13 and 120 years.";
    }

    if (!["male", "female", "other"].includes(values.gender)) {
        errors.gender = "Please choose your gender.";
    }

    return errors;
};

export default function ProfileUpdateForm({ user }: Readonly<{ user: UserRecord }>) {
    const { updateProfileAction, isLoading } = useAuth();
    const initialValues = useMemo(() => getInitialValues(user), [user]);

    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<ProfileFormState>(initialValues);
    const [fieldErrors, setFieldErrors] = useState<ProfileFormErrors>({});
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setFormData(initialValues);
    }, [initialValues]);

    useEffect(() => {
        if (!isOpen) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        setFormData(initialValues);
        setFieldErrors({});
        setSuccessMessage("");
        setErrorMessage("");
    }, [initialValues, isOpen]);

    const isDirty = useMemo(() => {
        return JSON.stringify(formData) !== JSON.stringify(initialValues);
    }, [formData, initialValues]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");

        const validationErrors = validateProfileForm(formData);
        setFieldErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        try {
            await updateProfileAction({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
            });

            setSuccessMessage("Profile updated successfully.");
            setTimeout(() => {
                setIsOpen(false);
            }, 800);
        } catch (error: any) {
            setErrorMessage(error?.message || "Unable to update profile.");
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="rounded-xl bg-[#0065A6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-black transition"
            >
                Update Profile
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <button
                        type="button"
                        aria-label="Close update profile modal"
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative w-full max-w-2xl rounded-2xl border border-black/10 bg-white p-5 shadow-2xl sm:p-6 max-h-[90vh] overflow-y-auto">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-base sm:text-lg font-semibold text-black">Update Profile</h3>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg border border-black/10 px-3 py-1.5 text-sm text-black/70 hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>

                        <form onSubmit={onSubmit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-black/75">First Name</label>
                                    <input
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={onChange}
                                        className="input-field"
                                    />
                                    {fieldErrors.firstName && (
                                        <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-black/75">Last Name</label>
                                    <input
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={onChange}
                                        className="input-field"
                                    />
                                    {fieldErrors.lastName && (
                                        <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-black/75">Email</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={onChange}
                                        className="input-field"
                                    />
                                    {fieldErrors.email && (
                                        <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-black/75">Phone Number</label>
                                    <input
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={onChange}
                                        className="input-field"
                                        placeholder="+91 98765 43210"
                                    />
                                    {fieldErrors.phoneNumber && (
                                        <p className="mt-1 text-xs text-red-600">{fieldErrors.phoneNumber}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-black/75">Date of Birth</label>
                                    <input
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={onChange}
                                        className="input-field"
                                    />
                                    {fieldErrors.dateOfBirth && (
                                        <p className="mt-1 text-xs text-red-600">{fieldErrors.dateOfBirth}</p>
                                    )}
                                </div>

                                <div>
                                    <p className="mb-1.5 block text-sm font-medium text-black/75">Gender</p>
                                    <div className="mt-1 flex flex-wrap gap-4 rounded-xl border border-black/10 p-3">
                                        {[
                                            { value: "male", label: "Male" },
                                            { value: "female", label: "Female" },
                                            { value: "other", label: "Other" },
                                        ].map((option) => (
                                            <label key={option.value} className="inline-flex items-center gap-2 text-sm text-black/80">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value={option.value}
                                                    checked={formData.gender === option.value}
                                                    onChange={onChange}
                                                    className="h-4 w-4 accent-[#0065A6]"
                                                />
                                                {option.label}
                                            </label>
                                        ))}
                                    </div>
                                    {fieldErrors.gender && (
                                        <p className="mt-1 text-xs text-red-600">{fieldErrors.gender}</p>
                                    )}
                                </div>
                            </div>

                            {errorMessage && (
                                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errorMessage}</p>
                            )}

                            {successMessage && (
                                <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</p>
                            )}

                            <div className="mt-5 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="rounded-xl border border-black/15 px-5 py-2.5 text-sm font-semibold text-black hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!isDirty || isLoading}
                                    className="rounded-xl bg-[#0065A6] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition"
                                >
                                    {isLoading ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
