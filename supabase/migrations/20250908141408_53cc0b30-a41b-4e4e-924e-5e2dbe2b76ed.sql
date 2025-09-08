-- Add a test document for Todd Morawe to verify the document display functionality
INSERT INTO public.user_documents (user_id, filename, original_name, document_type, file_type, file_size)
VALUES ('3c2aebae-0c51-45a1-b6dd-b3d35a037fce', 'test-certificates/zeugnis.pdf', 'Zeugnis_Test.pdf', 'zeugnis', 'application/pdf', 50000)
ON CONFLICT DO NOTHING;