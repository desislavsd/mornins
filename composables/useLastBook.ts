import books from '@/assets/registry.json'

const lastBookId = useLocalStorage('lastBookId', books.at(0)?.id)

const lastBook = computed(
  () => books.find((e) => e.id === lastBookId.value) || books.at(0)
)

export default useLastBook

function useLastBook() {
  return reactive({
    value: lastBook,
    set: setLastBook,
  })
}

function setLastBook(id?: string | (typeof books)[number]) {
  if (!id) return
  id = typeof id === 'string' ? id : id.id
  if (!books.map((e) => e.id).includes(id)) return
  lastBookId.value = id
}
