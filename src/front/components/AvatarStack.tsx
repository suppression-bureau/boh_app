import { avatarClasses } from "@mui/material/Avatar"
import AvatarGroup, { AvatarGroupProps } from "@mui/material/AvatarGroup"

interface AvatarStackProps extends AvatarGroupProps {
    spacing?: number // in spacing units
}

export default function AvatarStack({
    children,
    variant = "square",
    max = 10,
    spacing = 1,
    sx,
    ...props
}: AvatarStackProps) {
    // TODO: use spacing from theme (not easy since it gives a CSS string)
    const spacingInPixels = 8 * spacing
    return (
        <AvatarGroup
            variant={variant}
            max={max}
            // negative means apart from each other here…
            spacing={-spacingInPixels}
            sx={{
                [`& .${avatarClasses.root}`]: { border: 0 },
                ...sx,
            }}
            {...props}
        >
            {children}
        </AvatarGroup>
    )
}
