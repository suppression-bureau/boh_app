import { useQuery } from "urql"
import Box from "@mui/material/Box"
import { postsQueryDocument, PrincipleCard } from "./Principles"

export const Principles = () => {
    const [{ data }] = useQuery({ query: postsQueryDocument })
    return (
        <Box
            sx={{
                maxWidth: "350px",
                // marginBlock: 1,
                // marginInline: "auto",
                display: "flex",
                flexDirection: "column",
                rowGap: 1,
            }}
        >
            {data!.principle.map(({ id }) => (
                <PrincipleCard key={id} id={id} title={id} />
            ))}
        </Box>
    )
}
