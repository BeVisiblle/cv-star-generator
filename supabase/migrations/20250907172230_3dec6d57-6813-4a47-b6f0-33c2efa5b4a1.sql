-- Insert test data for demonstration
DO $$
DECLARE
    test_company_id uuid;
    test_job_id uuid;
BEGIN
    -- Get or create a test company
    SELECT id INTO test_company_id FROM companies LIMIT 1;
    
    IF test_company_id IS NULL THEN
        INSERT INTO companies (name, created_at) 
        VALUES ('Test Company GmbH', now()) 
        RETURNING id INTO test_company_id;
    END IF;
    
    -- Insert a test job post
    INSERT INTO job_posts (
        company_id, title, description_md, tasks_md, requirements_md,
        category, work_mode, employment, city, country,
        salary_currency, salary_min, salary_max, salary_interval,
        is_active, is_public, published_at
    ) VALUES (
        test_company_id,
        'Software Entwickler (m/w/d)',
        'Wir suchen einen motivierten Software Entwickler zur Verstärkung unseres Teams. Du arbeitest an spannenden Projekten und hilfst dabei, innovative Lösungen zu entwickeln.',
        E'• Entwicklung von Webanwendungen mit modernen Technologien\n• Code Reviews und Qualitätssicherung\n• Zusammenarbeit im agilen Team\n• Kontinuierliche Weiterbildung',
        E'• Abgeschlossenes Studium der Informatik oder vergleichbare Ausbildung\n• Erfahrung mit JavaScript, TypeScript, React\n• Kenntnisse in Node.js und Datenbanken\n• Teamplayer mit guter Kommunikation',
        'fachkraft',
        'hybrid',
        'vollzeit',
        'Berlin',
        'Deutschland',
        'EUR',
        3500,
        5500,
        'month',
        true,
        true,
        now()
    ) RETURNING id INTO test_job_id;
    
    -- Ensure the job has a slug
    PERFORM ensure_job_slug(test_job_id);
    
    RAISE NOTICE 'Test job created with ID: %', test_job_id;
END $$;