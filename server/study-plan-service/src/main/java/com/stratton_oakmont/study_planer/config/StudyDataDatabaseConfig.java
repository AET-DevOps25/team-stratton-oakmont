package com.stratton_oakmont.study_planer.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import jakarta.persistence.EntityManagerFactory;
import java.util.Properties;

@Configuration
@EnableJpaRepositories(
    basePackages = "com.stratton_oakmont.study_planer.repository.studydata",
    entityManagerFactoryRef = "studyDataEntityManagerFactory",
    transactionManagerRef = "studyDataTransactionManager"
)
public class StudyDataDatabaseConfig {
    
    @Value("${DB_STUDY_DATA_URL}")
    private String url;
    
    @Value("${DB_STUDY_DATA_USERNAME}")
    private String username;
    
    @Value("${DB_STUDY_DATA_PASSWORD}")
    private String password;
    
    @Bean(name = "studyDataDataSource")
    public DataSource studyDataDataSource() {
        return DataSourceBuilder.create()
                .url(url)
                .username(username)
                .password(password)
                .driverClassName("org.postgresql.Driver")
                .build();
    }

    @Bean(name = "studyDataEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean studyDataEntityManagerFactory() {
        LocalContainerEntityManagerFactoryBean em = new LocalContainerEntityManagerFactoryBean();
        em.setDataSource(studyDataDataSource());
        em.setPackagesToScan("com.stratton_oakmont.study_planer.entity.studydata");
        
        HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
        em.setJpaVendorAdapter(vendorAdapter);
        
        Properties properties = new Properties();
        properties.setProperty("hibernate.hbm2ddl.auto", "create-drop");
        properties.setProperty("hibernate.show_sql", "true");
        em.setJpaProperties(properties);
        
        return em;
    }

    @Bean(name = "studyDataTransactionManager")
    public PlatformTransactionManager studyDataTransactionManager() {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setEntityManagerFactory(studyDataEntityManagerFactory().getObject());
        return transactionManager;
    }
}