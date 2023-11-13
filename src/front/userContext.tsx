import axios from "axios"
import { ReactNode, createContext, useContext, useMemo, useState } from "react"

import { ItemRef, KnownRecipe, KnownSkill, UserData } from "./types"

const API_URL = "http://localhost:8000"

interface UserDataContextProps {
    knownItems: ItemRef[]
    knownSkills: KnownSkill[]
    knownRecipes: KnownRecipe[]
}

const UserDataContext = createContext<UserDataContextProps>({
    knownItems: [],
    knownSkills: [],
    knownRecipes: [],
})

export const useUserDataContext = (): UserDataContextProps =>
    useContext(UserDataContext)

interface UserDataContextProviderProps {
    children: ReactNode
}
export const UserDataContextProvider = ({
    children,
}: UserDataContextProviderProps) => {
    const [knownItems, setItems] = useState<ItemRef[]>([])
    const [knownSkills, setSkills] = useState<KnownSkill[]>([])
    const [knownRecipes, setRecipes] = useState<KnownRecipe[]>([])

    useMemo(() => {
        axios
            .get<UserData>(`${API_URL}/user_data`)
            .then(({ data }) => {
                const { items, skills, recipes } = data
                setItems(items)
                setSkills(skills)
                setRecipes(recipes)
            })
            .catch((error) => {
                console.log(error)
            })
    }, [setItems, setSkills, setRecipes])
    return (
        <UserDataContext.Provider
            value={{ knownItems, knownSkills, knownRecipes }}
        >
            {children}
        </UserDataContext.Provider>
    )
}
