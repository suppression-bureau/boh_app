import { useQuery } from "urql"
import axios from "axios"
import { useCallback, useReducer, useState } from "react"

import Autocomplete from "@mui/material/Autocomplete"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardHeader from "@mui/material/CardHeader"
import CardActions from "@mui/material/CardActions"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import Divider from "@mui/material/Divider"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import UpgradeIcon from "@mui/icons-material/Upgrade"

import { PrincipleCard } from "../routes/Principles"
import { graphql } from "../gql"
import * as types from "../gql/graphql"

const API_URL = "http://localhost:8000"

const skillQueryDocument = graphql(`
    query Skills {
        skill {
            id
            level
            primary_principle {
                id
            }
            secondary_principle {
                id
            }
        }
    }
`)

type SkillAction = { type: "increment"; skill: types.Skill["id"] }

function skillReducer(
    state: types.SkillsQuery["skill"],
    action: SkillAction,
): types.SkillsQuery["skill"] {
    switch (action.type) {
        case "increment": {
            return state.map((skill) => {
                if (skill.id !== action.skill) return skill
                return {
                    ...skill,
                    level: skill.level + 1,
                }
            })
        }
    }
}

interface SkillProps extends types.Skill {
    onIncrement(): void
}

function Skill(props: SkillProps) {
    // TODO: move into reducer
    const [skill, setSkill] = useState(props)

    async function upgradeSkill() {
        const response = await axios.patch(`${API_URL}/skill/${props.id}`, {
            level: props.level + 1,
        })
        setSkill(response.data)
        props.onIncrement()
    }

    return (
        <Card key={skill.id}>
            <CardHeader title={skill.id} />
            <CardActions sx={{ gap: 2 }}>
                <PrincipleCard
                    key={skill.primary_principle!.id}
                    id={skill.primary_principle!.id}
                    title={skill.level + 1}
                    sx={{ boxShadow: "none" }}
                    disablePadding
                />
                <Divider orientation="vertical" variant="middle" flexItem />
                <PrincipleCard
                    key={skill.secondary_principle!.id}
                    id={skill.secondary_principle!.id}
                    title={skill.level}
                    sx={{ boxShadow: "none" }}
                    disablePadding
                />
                <Button
                    endIcon={
                        <UpgradeIcon stroke="currentColor" strokeWidth={0.5} />
                    }
                    onClick={upgradeSkill}
                    sx={{ ml: "auto" }}
                >
                    Upgrade Skill
                </Button>
            </CardActions>
        </Card>
    )
}

const SkillsView = () => {
    // TODO: move into reducer
    const [{ data }] = useQuery({ query: skillQueryDocument })

    const [state, dispatch] = useReducer(skillReducer, data!.skill)

    const [open, setOpen] = useState(false)
    const [newSkill, setNewSkill] = useState<string | null>(null)

    const handleClickOpen = useCallback(() => {
        setOpen(true)
    }, [setOpen])

    const handleClose = useCallback(() => {
        setOpen(false)
    }, [setOpen])

    const handleSkillIncrement = useCallback(
        (skill: types.Skill["id"]) => {
            dispatch({ type: "increment", skill })
        },
        [dispatch],
    )
    const handleNewSkill = useCallback(
        (_event: React.SyntheticEvent, value: string | null) => {
            setNewSkill(value)
        },
        [setNewSkill],
    )
    // TODO: move into reducer
    const learnSkill = useCallback(() => {
        if (!newSkill) throw new Error("No skill selected")
        axios.patch(`${API_URL}/skill/${newSkill}`, { level: 1 }).then(() => {
            dispatch({ type: "increment", skill: newSkill })
            setOpen(false)
        })
    }, [dispatch, newSkill, setOpen])

    return (
        <Stack
            spacing={2}
            sx={{
                maxWidth: "450px",
                marginBlock: 1,
                marginInline: "auto",
            }}
        >
            <Button onClick={handleClickOpen} variant="contained">
                Learn new Skill
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <Autocomplete
                        id="skill-selector"
                        options={state
                            .filter(({ level }) => level == 0)
                            .map((s) => s.id)}
                        sx={{ width: 300 }}
                        renderInput={(params) => (
                            <TextField {...params} label="Skill" />
                        )}
                        onChange={handleNewSkill}
                    />
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button onClick={learnSkill} disabled={!newSkill}>
                            Learn
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
            {state
                .filter(({ level }) => level > 0)
                .map(({ ...skill }) => (
                    <Skill
                        key={skill.id}
                        onIncrement={() => handleSkillIncrement(skill.id)}
                        {...skill}
                    />
                ))}
        </Stack>
    )
}

export default SkillsView