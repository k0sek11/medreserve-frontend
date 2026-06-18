import {
    Avatar,
    Badge,
    Box,
    Button,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    Checkbox,
    ListItemText,
} from "@mui/material";
import { CameraAlt } from "@mui/icons-material";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useDoctorBioForm } from "../../hooks/useDoctorBioForm";

export const DoctorBio = () => {
    const { t } = useTranslation();
    const f = useDoctorBioForm();

    return (
        <Stack spacing={1.5} component="form" onSubmit={f.onSubmit}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                        <IconButton
                            size="small"
                            sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                width: 28,
                                height: 28,
                                "&:hover": { bgcolor: (t) => t.palette.primary.dark },
                            }}
                            onClick={() => f.fileInputRef.current?.click()}
                        >
                            <CameraAlt sx={{ fontSize: 16 }} />
                        </IconButton>
                    }
                >
                    <Avatar
                        src={f.profileImageSrc}
                        sx={{
                            width: 72,
                            height: 72,
                            fontSize: 30,
                            bgcolor: (t) => t.palette.divider,
                        }}
                    >
                        {f.profileQuery.data?.fullName?.charAt(0) ?? "?"}
                    </Avatar>
                </Badge>
                <Box>
                    <Typography sx={{ fontWeight: 800, color: "text.primary", fontSize: 20 }}>
                        {f.profileQuery.data?.fullName ?? t("doctorProfile.profileName")}
                    </Typography>
                    <Typography sx={{ color: "text.secondary" }}>
                        {t("doctorProfile.licenseNumber")}:{" "}
                        {f.profileQuery.data?.licenseNumber ?? "-"}
                    </Typography>
                </Box>
            </Box>

            <input
                ref={f.fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={f.handleFileChange}
            />
            {f.uploadPhotoMutation.isPending && (
                <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                    {t("common.saving")}
                </Typography>
            )}
            {f.uploadPhotoMutation.isError && (
                <Typography sx={{ color: "error.main", fontSize: 13 }}>
                    {t("common.errorOccurred")}
                </Typography>
            )}

            <Typography sx={{ fontWeight: 700, color: "text.secondary", mt: 1 }}>
                {t("doctorProfile.personalData")}
            </Typography>

            <Stack spacing={1.5}>
                <TextField
                    label={t("profileCompletion.firstNameLabel")}
                    {...f.register("firstName")}
                    error={!!f.errors.firstName}
                    helperText={
                        f.errors.firstName?.message ? t(f.errors.firstName.message) : undefined
                    }
                    fullWidth
                />
                <TextField
                    label={t("profileCompletion.lastNameLabel")}
                    {...f.register("lastName")}
                    error={!!f.errors.lastName}
                    helperText={
                        f.errors.lastName?.message ? t(f.errors.lastName.message) : undefined
                    }
                    fullWidth
                />
                <TextField
                    label={t("doctorProfile.bio")}
                    {...f.register("bio")}
                    multiline
                    minRows={3}
                    fullWidth
                />
                <FormControl fullWidth error={!!f.errors.specializationIds}>
                    <InputLabel>{t("doctorProfile.specializations")}</InputLabel>
                    <Controller
                        name="specializationIds"
                        control={f.control}
                        render={({ field }) => (
                            <Select
                                multiple
                                label={t("doctorProfile.specializations")}
                                {...field}
                                renderValue={(selected) =>
                                    (f.specializationsQuery.data ?? [])
                                        .filter((s) =>
                                            (selected as number[]).includes(s.specializationId),
                                        )
                                        .map((s) => s.name)
                                        .join(", ")
                                }
                            >
                                {(f.specializationsQuery.data ?? []).map((spec) => (
                                    <MenuItem
                                        key={spec.specializationId}
                                        value={spec.specializationId}
                                    >
                                        <Checkbox
                                            checked={(field.value as number[]).includes(
                                                spec.specializationId,
                                            )}
                                        />
                                        <ListItemText primary={spec.name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    />
                </FormControl>
            </Stack>

            <Button
                type="submit"
                variant="contained"
                disabled={f.saveProfileMutation.isPending || f.isSubmitting}
                sx={{ textTransform: "none", fontWeight: 700, mt: 1 }}
            >
                {f.saveProfileMutation.isPending || f.isSubmitting
                    ? t("common.saving")
                    : t("common.save")}
            </Button>
            {f.saveProfileMutation.isSuccess && (
                <Typography sx={{ color: "success.main", fontWeight: 600 }}>
                    {t("doctorProfile.saved")}
                </Typography>
            )}
        </Stack>
    );
};
