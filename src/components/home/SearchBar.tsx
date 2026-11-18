import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Search } from "lucide-react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { supabase } from "@/lib/supabase";

type SearchSuggestion = {
  id: string;
  subject: string;
  title: string | null;
};

function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();

  /*
   * =====================================================
   * QUERY FROM URL
   * =====================================================
   */
  const searchParams = new URLSearchParams(
    location.search
  );

  const urlQuery =
    searchParams.get("q") ?? "";

  /*
   * =====================================================
   * SEARCH BAR VALUE
   * =====================================================
   */
  const [query, setQuery] =
    useState(urlQuery);

  /*
   * =====================================================
   * SUGGESTION SEARCH VALUE
   * =====================================================
   */
  const [
    suggestionQuery,
    setSuggestionQuery,
  ] = useState(urlQuery);

  /*
   * =====================================================
   * SUGGESTIONS
   * =====================================================
   */
  const [
    suggestions,
    setSuggestions,
  ] = useState<SearchSuggestion[]>([]);

  /*
   * =====================================================
   * SHOW / HIDE SUGGESTIONS
   * =====================================================
   */
  const [
    showSuggestions,
    setShowSuggestions,
  ] = useState(false);

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */
  const [
    loadingSuggestions,
    setLoadingSuggestions,
  ] = useState(false);

  /*
   * =====================================================
   * SELECTED SUGGESTION
   * =====================================================
   */
  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(-1);

  /*
   * =====================================================
   * CONTAINER REF
   * =====================================================
   */
  const searchContainerRef =
    useRef<HTMLDivElement>(null);

  /*
   * =====================================================
   * INPUT REF
   * =====================================================
   */
  const inputRef =
    useRef<HTMLInputElement>(null);

  /*
   * =====================================================
   * SYNC WITH URL
   * =====================================================
   */
  useEffect(() => {
    setQuery(urlQuery);
    setSuggestionQuery(urlQuery);
    setSelectedIndex(-1);
  }, [urlQuery]);

  /*
   * =====================================================
   * FETCH SEARCH SUGGESTIONS
   * =====================================================
   */
  useEffect(() => {
    const trimmedQuery =
      suggestionQuery.trim();

    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      setSelectedIndex(-1);

      return;
    }

    setSelectedIndex(-1);

    const timer = setTimeout(
      async () => {
        try {
          setLoadingSuggestions(true);

          const safeQuery =
            trimmedQuery.replace(
              /,/g,
              " "
            );

          const {
            data,
            error,
          } = await supabase
            .from("reviews")
            .select(
              "id, subject, title"
            )
            .or(
              `subject.ilike.%${safeQuery}%,title.ilike.%${safeQuery}%`
            )
            .limit(8);

          if (error) {
            console.error(
              "SEARCH SUGGESTIONS ERROR:",
              error
            );

            setSuggestions([]);
            setShowSuggestions(false);

            return;
          }

          const newSuggestions =
            (data as SearchSuggestion[]) ??
            [];

          setSuggestions(
            newSuggestions
          );

          if (
            newSuggestions.length > 0
          ) {
            setShowSuggestions(true);
          } else {
            setShowSuggestions(false);
          }
        } catch (error) {
          console.error(
            "SEARCH SUGGESTIONS ERROR:",
            error
          );

          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setLoadingSuggestions(false);
        }
      },
      300
    );

    return () => {
      clearTimeout(timer);
    };
  }, [suggestionQuery]);

  /*
   * =====================================================
   * CLOSE DROPDOWN WHEN CLICKING OUTSIDE
   * =====================================================
   */
  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent
    ) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(
          event.target as Node
        )
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
   * =====================================================
   * PERFORM SEARCH
   * =====================================================
   */
  function performSearch(
    searchValue: string
  ) {
    const trimmedQuery =
      searchValue.trim();

    setShowSuggestions(false);
    setSelectedIndex(-1);

    if (!trimmedQuery) {
      navigate("/search");
      return;
    }

    navigate(
      `/search?q=${encodeURIComponent(
        trimmedQuery
      )}`
    );
  }

  /*
   * =====================================================
   * FORM SUBMIT
   * =====================================================
   */
  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    performSearch(query);
  }

  /*
   * =====================================================
   * KEYBOARD NAVIGATION
   * =====================================================
   */
  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    /*
     * =================================================
     * ARROW DOWN
     * =================================================
     */
    if (
      event.key === "ArrowDown"
    ) {
      if (
        suggestions.length === 0
      ) {
        return;
      }

      event.preventDefault();

      inputRef.current?.focus();

      setShowSuggestions(true);

      setSelectedIndex(
        (currentIndex) => {
          let nextIndex: number;

          if (currentIndex === -1) {
            nextIndex = 0;
          } else if (
            currentIndex >=
            suggestions.length - 1
          ) {
            nextIndex = 0;
          } else {
            nextIndex =
              currentIndex + 1;
          }

          setQuery(
            suggestions[nextIndex]
              .subject
          );

          return nextIndex;
        }
      );

      return;
    }

    /*
     * =================================================
     * ARROW UP
     * =================================================
     */
    if (
      event.key === "ArrowUp"
    ) {
      if (
        suggestions.length === 0
      ) {
        return;
      }

      event.preventDefault();

      inputRef.current?.focus();

      setShowSuggestions(true);

      setSelectedIndex(
        (currentIndex) => {
          let nextIndex: number;

          if (currentIndex === -1) {
            nextIndex =
              suggestions.length - 1;
          } else if (currentIndex <= 0) {
            nextIndex =
              suggestions.length - 1;
          } else {
            nextIndex =
              currentIndex - 1;
          }

          setQuery(
            suggestions[nextIndex]
              .subject
          );

          return nextIndex;
        }
      );

      return;
    }

    /*
     * =================================================
     * ESCAPE
     * =================================================
     */
    if (
      event.key === "Escape"
    ) {
      event.preventDefault();

      setShowSuggestions(false);
      setSelectedIndex(-1);

      return;
    }

    /*
     * =================================================
     * ENTER
     * =================================================
     */
    if (
      event.key === "Enter"
    ) {
      return;
    }
  }

  /*
   * =====================================================
   * USER TYPES SOMETHING
   * =====================================================
   */
  function handleInputChange(
    value: string
  ) {
    setQuery(value);

    setSuggestionQuery(value);

    setSelectedIndex(-1);

    if (
      value.trim().length >= 2
    ) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }

  /*
   * =====================================================
   * CLICK SUGGESTION
   * =====================================================
   */
  function handleSuggestionClick(
    suggestion: SearchSuggestion
  ) {
    setQuery(
      suggestion.subject
    );

    setSuggestionQuery(
      suggestion.subject
    );

    setSelectedIndex(-1);

    performSearch(
      suggestion.subject
    );
  }

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */
  return (
    <section className="px-4 pb-8 sm:px-10 sm:pb-12 lg:px-16">
      <div className="mx-auto max-w-4xl">

        <form
          onSubmit={handleSubmit}
          className="
            flex
            flex-col
            gap-2.5
            rounded-2xl
            border
            border-blue-100
            bg-white
            p-2
            shadow-[0_8px_30px_rgba(59,130,246,0.15)]
            sm:gap-3
            sm:rounded-full
            sm:p-2
            sm:flex-row
          "
        >

          {/* =================================================
              SEARCH INPUT CONTAINER
          ================================================== */}
          <div
            ref={searchContainerRef}
            className="relative min-w-0 flex-1"
          >

            {/* Search icon */}
            <Search
              className="
                absolute
                left-3.5
                top-1/2
                z-10
                size-[18px]
                -translate-y-1/2
                text-blue-700
                sm:left-4
                sm:size-5
              "
              aria-hidden="true"
            />

            {/* =================================================
                SEARCH INPUT
            ================================================== */}
            <Input
              ref={inputRef}
              type="search"

              value={query}

              onChange={(event) => {
                handleInputChange(
                  event.target.value
                );
              }}

              onFocus={() => {
                if (
                  suggestions.length > 0 &&
                  query.trim().length >= 2
                ) {
                  setShowSuggestions(true);
                }
              }}

              onKeyDown={
                handleKeyDown
              }

              placeholder="Search products, services, places or anything..."

              className="
                h-11
                border-0
                bg-transparent
                pl-11
                pr-3
                text-sm
                text-slate-700
                shadow-none
                placeholder:text-slate-400
                focus-visible:ring-0
                sm:h-12
                sm:pl-12
                sm:pr-4
              "

              aria-label="Search reviews"

              autoComplete="off"

              role="combobox"

              aria-expanded={
                showSuggestions
              }

              aria-autocomplete="list"

              aria-controls="search-suggestions"

              aria-activedescendant={
                selectedIndex >= 0
                  ? `search-suggestion-${selectedIndex}`
                  : undefined
              }
            />

            {/* =================================================
                SUGGESTIONS
            ================================================== */}
            {showSuggestions &&
              query.trim().length >= 2 && (
                <div
                  id="search-suggestions"
                  className="
                    absolute
                    left-0
                    right-0
                    top-12
                    z-50
                    max-h-72
                    overflow-y-auto
                    overflow-hidden
                    rounded-2xl
                    border
                    border-blue-100
                    bg-white
                    shadow-[0_12px_35px_rgba(59,130,246,0.16)]
                    sm:top-14
                    sm:max-h-none
                  "
                  role="listbox"
                >

                  {/* Loading */}
                  {loadingSuggestions ? (
                    <div className="px-4 py-3 text-sm text-slate-500">
                      Searching...
                    </div>
                  ) : suggestions.length >
                    0 ? (

                    <div className="py-1.5 sm:py-2">

                      {suggestions.map(
                        (
                          suggestion,
                          index
                        ) => {
                          const isSelected =
                            index ===
                            selectedIndex;

                          return (
                            <button
                              key={
                                suggestion.id
                              }

                              id={`search-suggestion-${index}`}

                              type="button"

                              role="option"

                              aria-selected={
                                isSelected
                              }

                              onMouseDown={(
                                event
                              ) => {
                                event.preventDefault();

                                handleSuggestionClick(
                                  suggestion
                                );
                              }}

                              className={`

                                flex
                                min-h-12
                                w-full
                                items-center
                                gap-3
                                border-l-4
                                px-3.5
                                py-2.5
                                text-left
                                transition-colors

                                sm:min-h-0
                                sm:px-4
                                sm:py-3

                                ${
                                  isSelected
                                    ? "border-l-blue-600 bg-blue-50 text-slate-900"
                                    : "border-l-transparent hover:bg-blue-50/70"
                                }
                              `}
                            >

                              {/* Search icon */}
                              <Search
                                className={`
                                  mt-0.5
                                  size-4
                                  shrink-0

                                  ${
                                    isSelected
                                      ? "text-blue-600"
                                      : "text-slate-400"
                                  }
                                `}
                                aria-hidden="true"
                              />

                              {/* Suggestion text */}
                              <div className="min-w-0 flex-1">

                                <p
                                  className={`
                                    truncate
                                    text-sm

                                    ${
                                      isSelected
                                        ? "font-bold text-slate-900"
                                        : "font-medium text-slate-700"
                                    }
                                  `}
                                >
                                  {
                                    suggestion.subject
                                  }
                                </p>

                                {suggestion.title && (
                                  <p className="mt-0.5 truncate text-xs text-slate-400">
                                    {
                                      suggestion.title
                                    }
                                  </p>
                                )}

                              </div>

                              {isSelected && (
                                <span className="ml-auto shrink-0 text-sm font-bold text-blue-600">
                                  →
                                </span>
                              )}

                            </button>
                          );
                        }
                      )}

                    </div>

                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">
                      No matching suggestions
                    </div>
                  )}

                </div>
              )}

          </div>

          {/* =================================================
              SEARCH BUTTON
          ================================================== */}
          <Button
            type="submit"
            className="
              h-11
              w-full
              shrink-0
              rounded-xl
              border-0
              bg-gradient-to-r
              from-blue-600
              to-blue-500
              px-6
              text-sm
              font-semibold
              text-white
              shadow-md
              shadow-blue-200
              transition-all
              duration-200
              hover:from-blue-700
              hover:to-blue-600
              hover:shadow-lg
              hover:shadow-blue-200
              sm:h-12
              sm:w-auto
              sm:rounded-full
              sm:px-8
            "
          >
            Search
            <span className="ml-1.5 text-base">
              →
            </span>
          </Button>

        </form>

      </div>
    </section>
  );
}

export default SearchBar;