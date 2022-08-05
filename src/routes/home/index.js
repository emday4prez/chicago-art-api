import { h } from 'preact'

import { useState, useEffect, useReducer } from 'preact/hooks'

import axios from 'axios'
import style from './style.css'

const useDataApi = (initialUrl, initialData) => {
    const [url, setUrl] = useState(initialUrl)

    const [state, dispatch] = useReducer(dataFetchReducer, {
        isLoading: false,
        isError: false,
        data: initialData,
    })

    useEffect(() => {
        let didCancel = false
        const fetchData = async () => {
            dispatch({ type: 'FETCH_INIT' })
            try {
                const result = await axios(url)
                if (!didCancel)
                    dispatch({ type: 'FETCH_SUCCESS', payload: result.data })
            } catch (e) {
                if (!didCancel) {
                    dispatch({ type: 'FETCH_FAILURE' })
                }
            }
        }
        fetchData()
        return () => {
            didCancel = true
        }
    }, [url])
    return [state, setUrl]
}

const dataFetchReducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_INIT':
            return {
                ...state,
                isLoading: true,
                isError: false,
            }
        case 'FETCH_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload,
            }
        case 'FETCH_FAILURE':
            return {
                ...state,
                isLoading: false,
                isError: true,
            }
        default:
            throw new Error()
    }
}

const Home = () => {
    const [query, setQuery] = useState('')

    const [{ data, isLoading, isError }, doFetch] = useDataApi(
        'https://api.artic.edu/api/v1/artworks?fields=id,title,artist_display,date_display,main_reference_number?&query[term][is_public_domain]=truepage=1&limit=100',
        {
            data: [],
        }
    )
    const listOfArt = data.data
    const pagination = data.pagination
    console.log('data.pagination:', pagination)
    // const handlePageChange = (e) => {
    //     setCurrentPage(Number(e.target.textContent))
    // }
    // let page = data.hits
    // console.log('data', data)
    // if (page.length >= 1) {
    //     page = paginate(page, currentPage, pageSize)
    //     console.log(`currentPage: ${currentPage}`)
    // }

    return (
        <div class={style.home}>
            <h1>Home</h1>
            <form
                onSubmit={(event) => {
                    doFetch(
                        `https://api.artic.edu/api/v1/artworks/search?q=${query}&query[term][is_public_domain]=true`
                    )

                    event.preventDefault()
                }}
            >
                <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
                <button type="submit">Search</button>
            </form>

            <div onClick={() => doFetch(pagination.prev_url)}>
                <p class={style.button}>previous</p>
            </div>

            <div onClick={() => doFetch(pagination.next_url)}>
                <p class={style.button}>next page</p>
            </div>

            {isError && <div>Something went wrong ...</div>}
            {isLoading ? (
                <div>Loading ...</div>
            ) : (
                <div class={style.listGroup}>
                    {listOfArt.map((piece) => {
                        return (
                            <div class={style.listElement} key={piece.id}>
                                <div>{piece.artist_display}</div>
                                <div>{piece.title}</div>
                                <div>{piece.id}</div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default Home
