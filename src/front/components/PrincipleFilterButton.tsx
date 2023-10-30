import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"

import * as types from "../gql/graphql"
import { PrincipleIcon } from "../routes/Principles"

type Principle = Pick<types.Principle, "id">

interface PrincipleFilterButtonProps {
    principle: Principle
    selectedPrinciple?: Principle | undefined
    count?: number | string | undefined
    handlePrincipleFilter(principle: Principle): void
}

const PrincipleFilterButton = ({
    principle,
    selectedPrinciple,
    count,
    handlePrincipleFilter,
}: PrincipleFilterButtonProps) =>
    count ? (
        <Button
            startIcon={<PrincipleIcon id={principle.id} />}
            variant={
                selectedPrinciple?.id === principle.id
                    ? "contained"
                    : "outlined"
            }
        >
            {count}
        </Button>
    ) : (
        <IconButton
            onClick={() => handlePrincipleFilter(principle)}
            sx={{
                backgroundColor:
                    principle.id === selectedPrinciple?.id
                        ? "primary.dark"
                        : undefined,
                "&:hover": {
                    backgroundColor:
                        principle.id === selectedPrinciple?.id
                            ? "primary.light"
                            : undefined,
                },
            }}
        >
            {<PrincipleIcon id={principle.id} />}
        </IconButton>
    )

export default PrincipleFilterButton
