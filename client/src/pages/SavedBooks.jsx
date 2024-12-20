import { useQuery, useMutation,} from '@apollo/client';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';

const SavedBooks = () => {
const { loading, data } = useQuery(GET_ME);
const userData = data?.me ? { ...data.me, savedBooks: data.me.savedBooks || [] } : null;
const [deleteBook] = useMutation(REMOVE_BOOK);

  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) return false;

    try {
      await deleteBook({
        variables: { bookId },
        update(cache) {
          const existingData = cache.readQuery({ query: GET_ME });
          if (existingData?.me) {
            const newSavedBooks = existingData.me.savedBooks.filter((book) => book.bookId !== bookId);
            cache.writeQuery({
              query: GET_ME,
              data: {
                me: {
                  ...existingData.me,
                  savedBooks: newSavedBooks,
                },
              },
            });
          }
        },
      });

      removeBookId(bookId);
    } catch (err) {
      console.error('Error deleting book:', err);
    }
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className="pt-5">
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book) => (
            <Col key={book.bookId} md="4">
              <Card border="dark">
                {book.image && <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant="top" />}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className="btn-block btn-danger" onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
